-- Aviation Safety Management System Database Schema (No RLS)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for status tracking
CREATE TYPE occurrence_status AS ENUM ('reported', 'in_review', 'under_investigation', 'closed');
CREATE TYPE occurrence_type AS ENUM ('incident', 'accident', 'hazard', 'observation');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE investigation_stage AS ENUM ('not_started', 'data_collection', 'analysis', 'recommendations', 'review', 'completed');
CREATE TYPE action_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue');
CREATE TYPE user_role AS ENUM ('admin', 'safety_officer', 'investigator', 'reporter', 'readonly');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'reporter',
    position TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aircraft table
CREATE TABLE aircraft (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Occurrence reports table
CREATE TABLE occurrences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    occurrence_date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    occurrence_type occurrence_type NOT NULL,
    severity severity_level NOT NULL DEFAULT 'medium',
    status occurrence_status NOT NULL DEFAULT 'reported',
    description TEXT NOT NULL,
    aircraft_id UUID REFERENCES aircraft(id),
    reporter_id UUID NOT NULL REFERENCES profiles(id),
    assigned_to UUID REFERENCES profiles(id),
    weather_conditions TEXT,
    flight_phase TEXT,
    immediate_actions TEXT,
    is_invalid BOOLEAN DEFAULT FALSE,
    invalid_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Investigations table
CREATE TABLE investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    occurrence_id UUID NOT NULL UNIQUE REFERENCES occurrences(id) ON DELETE CASCADE,
    lead_investigator_id UUID REFERENCES profiles(id),
    stage investigation_stage NOT NULL DEFAULT 'not_started',
    findings TEXT,
    root_causes TEXT,
    contributing_factors TEXT,
    recommendations TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Investigation updates/notes
CREATE TABLE investigation_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Corrective actions
CREATE TABLE corrective_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    assigned_to UUID REFERENCES profiles(id),
    status action_status NOT NULL DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attachments for occurrences and investigations
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    occurrence_id UUID REFERENCES occurrences(id) ON DELETE CASCADE,
    investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        (occurrence_id IS NOT NULL AND investigation_id IS NULL) OR
        (occurrence_id IS NULL AND investigation_id IS NOT NULL)
    )
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create a view for dashboard statistics
CREATE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM occurrences WHERE status != 'closed') AS open_occurrences,
    (SELECT COUNT(*) FROM occurrences WHERE status = 'closed') AS closed_occurrences,
    (SELECT COUNT(*) FROM occurrences WHERE created_at > NOW() - INTERVAL '30 days') AS occurrences_last_30_days,
    (SELECT COUNT(*) FROM corrective_actions WHERE status = 'pending') AS pending_actions,
    (SELECT COUNT(*) FROM corrective_actions WHERE status = 'overdue') AS overdue_actions;

-- Create indexes for better performance
CREATE INDEX occurrences_status_idx ON occurrences(status);
CREATE INDEX occurrences_date_idx ON occurrences(occurrence_date);
CREATE INDEX occurrences_type_idx ON occurrences(occurrence_type);
CREATE INDEX investigations_stage_idx ON investigations(stage);
CREATE INDEX actions_status_idx ON corrective_actions(status);
CREATE INDEX actions_due_date_idx ON corrective_actions(due_date);

-- Function to automatically create an investigation when an occurrence is created
CREATE OR REPLACE FUNCTION create_investigation_for_occurrence()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO investigations (occurrence_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create investigation automatically
CREATE TRIGGER create_investigation_after_occurrence
AFTER INSERT ON occurrences
FOR EACH ROW
EXECUTE FUNCTION create_investigation_for_occurrence();

-- Function to update occurrence status when investigation stage changes
CREATE OR REPLACE FUNCTION update_occurrence_status_on_investigation_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stage = 'not_started' THEN
        UPDATE occurrences SET status = 'in_review' WHERE id = NEW.occurrence_id;
    ELSIF NEW.stage IN ('data_collection', 'analysis', 'recommendations') THEN
        UPDATE occurrences SET status = 'under_investigation' WHERE id = NEW.occurrence_id;
    ELSIF NEW.stage = 'completed' THEN
        UPDATE occurrences SET status = 'closed' WHERE id = NEW.occurrence_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update occurrence status
CREATE TRIGGER update_occurrence_status
AFTER UPDATE ON investigations
FOR EACH ROW
WHEN (OLD.stage IS DISTINCT FROM NEW.stage)
EXECUTE FUNCTION update_occurrence_status_on_investigation_update();

-- Function to automatically create notification when an action is assigned
CREATE OR REPLACE FUNCTION create_notification_for_action_assignment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.assigned_to IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, link)
        VALUES (
            NEW.assigned_to,
            'New Action Assigned',
            'You have been assigned a new corrective action: ' || NEW.title,
            '/actions/' || NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Separate triggers for INSERT and UPDATE operations
-- Trigger for new action assignments (INSERT)
CREATE TRIGGER create_notification_on_new_action
AFTER INSERT ON corrective_actions
FOR EACH ROW
WHEN (NEW.assigned_to IS NOT NULL)
EXECUTE FUNCTION create_notification_for_action_assignment();

-- Trigger for reassigned actions (UPDATE)
CREATE TRIGGER create_notification_on_reassigned_action
AFTER UPDATE OF assigned_to ON corrective_actions
FOR EACH ROW
WHEN (NEW.assigned_to IS DISTINCT FROM OLD.assigned_to)
EXECUTE FUNCTION create_notification_for_action_assignment();

-- Function to automatically update action status to overdue
CREATE OR REPLACE FUNCTION update_overdue_actions()
RETURNS void AS $$
BEGIN
    UPDATE corrective_actions
    SET status = 'overdue'
    WHERE due_date < CURRENT_DATE
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Create initial admin user (you'll need to update this with your user ID after signing up)
-- INSERT INTO profiles (id, email, full_name, role)
-- VALUES ('your-auth-user-id', 'admin@example.com', 'Admin User', 'admin');