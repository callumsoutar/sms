import Link from 'next/link';
import { supabase } from '../../../../lib/supabase';
import { Plus, Search, AlertTriangle, Filter, ArrowUpDown, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ActionStatus } from '../../../../types/schema';
import AutoSubmitForm from '../../../../components/ui/AutoSubmitForm';

export const metadata = {
  title: 'Corrective Actions - Aviation SMS',
  description: 'Manage corrective actions in the safety management system',
};

export default async function ActionsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Parse query parameters
  const status = searchParams.status as ActionStatus | undefined;
  const search = searchParams.search as string | undefined;
  const sortBy = searchParams.sortBy as string || 'due_date';
  const sortOrder = searchParams.sortOrder as string || 'asc';
  
  // Build query
  let query = supabase
    .from('corrective_actions')
    .select(`
      *,
      investigation:investigations!investigation_id(
        id, 
        occurrence_id,
        occurrences:occurrences!occurrence_id(id, title)
      ),
      assignee:profiles!assigned_to(id, full_name)
    `)
    .order(sortBy, { ascending: sortOrder === 'asc' });
  
  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }
  
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  // Execute query
  const { data: actions, error } = await query;
  
  if (error) {
    console.error('Error fetching actions:', error);
  }

  // Helper function to get status badge color
  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: ActionStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="mr-1.5 h-4 w-4" />;
      case 'in_progress':
        return <AlertCircle className="mr-1.5 h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="mr-1.5 h-4 w-4" />;
      case 'overdue':
        return <AlertTriangle className="mr-1.5 h-4 w-4" />;
      default:
        return null;
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Check for overdue actions and update their status
  const checkOverdueActions = async () => {
    const today = new Date();
    const overdueActions = actions?.filter(action => 
      action.status !== 'completed' && 
      action.due_date && 
      new Date(action.due_date) < today
    );

    if (overdueActions && overdueActions.length > 0) {
      for (const action of overdueActions) {
        if (action.status !== 'overdue') {
          await supabase
            .from('corrective_actions')
            .update({ status: 'overdue' })
            .eq('id', action.id);
        }
      }
    }
  };

  // Call the function to check for overdue actions
  if (actions) {
    checkOverdueActions();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Corrective Actions</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track and manage safety actions across the organization
          </p>
        </div>
        <Link
          href="/dashboard/actions/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Action
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <form action="" method="get">
              <input
                type="text"
                name="search"
                id="search"
                defaultValue={search}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search actions..."
              />
              {/* Preserve other query params */}
              {status && <input type="hidden" name="status" value={status} />}
              {sortBy && <input type="hidden" name="sortBy" value={sortBy} />}
              {sortOrder && <input type="hidden" name="sortOrder" value={sortOrder} />}
            </form>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative inline-block text-left">
              <AutoSubmitForm className="inline-block">
                <select
                  name="status"
                  defaultValue={status || ''}
                  className="block pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
                {/* Preserve other query params */}
                {search && <input type="hidden" name="search" value={search} />}
                {sortBy && <input type="hidden" name="sortBy" value={sortBy} />}
                {sortOrder && <input type="hidden" name="sortOrder" value={sortOrder} />}
              </AutoSubmitForm>
            </div>
            
            <Link
              href="/dashboard/actions"
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Link>
          </div>
        </div>
      </div>
      
      {/* Actions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Link 
                    href={`/dashboard/actions?sortBy=title&sortOrder=${sortBy === 'title' && sortOrder === 'asc' ? 'desc' : 'asc'}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}
                    className="group inline-flex items-center"
                  >
                    Title
                    <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                  </Link>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Link 
                    href={`/dashboard/actions?sortBy=status&sortOrder=${sortBy === 'status' && sortOrder === 'asc' ? 'desc' : 'asc'}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}
                    className="group inline-flex items-center"
                  >
                    Status
                    <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                  </Link>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Link 
                    href={`/dashboard/actions?sortBy=due_date&sortOrder=${sortBy === 'due_date' && sortOrder === 'asc' ? 'desc' : 'asc'}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}
                    className="group inline-flex items-center"
                  >
                    Due Date
                    <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                  </Link>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Assigned To
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Related Occurrence
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {actions && actions.length > 0 ? (
                actions.map((action) => (
                  <tr key={action.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{action.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(action.status as ActionStatus)}`}>
                        {getStatusIcon(action.status as ActionStatus)}
                        {action.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(action.due_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {action.assignee && action.assignee[0] ? action.assignee[0].full_name : 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {action.investigation && 
                       action.investigation[0] && 
                       action.investigation[0].occurrences && 
                       action.investigation[0].occurrences[0] && (
                        <Link 
                          href={`/dashboard/occurrences/${action.investigation[0].occurrences[0].id}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          {action.investigation[0].occurrences[0].title}
                        </Link>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/dashboard/actions/${action.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-4"
                      >
                        View
                      </Link>
                      <Link 
                        href={`/dashboard/actions/${action.id}/edit`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-base font-medium text-gray-900 dark:text-white mb-1">No corrective actions found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your search or filters, or add a new corrective action.
                      </p>
                      <div className="mt-4">
                        <Link
                          href="/dashboard/actions/new"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Action
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 