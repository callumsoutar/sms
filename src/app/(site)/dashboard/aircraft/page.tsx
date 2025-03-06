import Link from 'next/link';
import { supabase } from '../../../../lib/supabase';
import { Plus, Search, AlertTriangle, Plane, Filter, ArrowUpDown } from 'lucide-react';
import { Aircraft } from '../../../../types/schema';
import AutoSubmitForm from '../../../../components/ui/AutoSubmitForm';

export const metadata = {
  title: 'Aircraft - Aviation SMS',
  description: 'Manage aircraft in the safety management system',
};

export default async function AircraftPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Parse query parameters
  const status = searchParams.status as string | undefined;
  const type = searchParams.type as string | undefined;
  const search = searchParams.search as string | undefined;
  const sortBy = searchParams.sortBy as string || 'registration';
  const sortOrder = searchParams.sortOrder as string || 'asc';
  
  // Build query
  let query = supabase
    .from('aircraft')
    .select('*')
    .order(sortBy, { ascending: sortOrder === 'asc' });
  
  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }
  
  if (type) {
    query = query.eq('type', type);
  }
  
  if (search) {
    query = query.or(`registration.ilike.%${search}%,model.ilike.%${search}%,type.ilike.%${search}%`);
  }
  
  // Execute query
  const { data: aircraft, error } = await query;
  
  if (error) {
    console.error('Error fetching aircraft:', error);
  }

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
      case 'retired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  // Cast the aircraft data to the proper type
  const typedAircraft = aircraft as unknown as Aircraft[];

  // Get unique aircraft types for filter
  const uniqueTypes = Array.from(new Set(typedAircraft?.map(a => a.type) || []));
  
  // Get unique statuses for filter
  const uniqueStatuses = Array.from(new Set(typedAircraft?.map(a => a.status) || []));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Aircraft</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage aircraft in the safety management system
          </p>
        </div>
        <Link
          href="/dashboard/aircraft/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Aircraft
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
                placeholder="Search aircraft..."
              />
              {/* Preserve other query params */}
              {status && <input type="hidden" name="status" value={status} />}
              {type && <input type="hidden" name="type" value={type} />}
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
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {/* Preserve other query params */}
                {search && <input type="hidden" name="search" value={search} />}
                {type && <input type="hidden" name="type" value={type} />}
                {sortBy && <input type="hidden" name="sortBy" value={sortBy} />}
                {sortOrder && <input type="hidden" name="sortOrder" value={sortOrder} />}
              </AutoSubmitForm>
            </div>
            
            <div className="relative inline-block text-left">
              <AutoSubmitForm className="inline-block">
                <select
                  name="type"
                  defaultValue={type || ''}
                  className="block pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="">All Types</option>
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {/* Preserve other query params */}
                {search && <input type="hidden" name="search" value={search} />}
                {status && <input type="hidden" name="status" value={status} />}
                {sortBy && <input type="hidden" name="sortBy" value={sortBy} />}
                {sortOrder && <input type="hidden" name="sortOrder" value={sortOrder} />}
              </AutoSubmitForm>
            </div>
            
            <Link
              href="/dashboard/aircraft"
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Link>
          </div>
        </div>
      </div>
      
      {/* Aircraft List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Link 
                    href={`/dashboard/aircraft?sortBy=registration&sortOrder=${sortBy === 'registration' && sortOrder === 'asc' ? 'desc' : 'asc'}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}${type ? `&type=${type}` : ''}`}
                    className="group inline-flex items-center"
                  >
                    Registration
                    <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                  </Link>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Link 
                    href={`/dashboard/aircraft?sortBy=type&sortOrder=${sortBy === 'type' && sortOrder === 'asc' ? 'desc' : 'asc'}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}${type ? `&type=${type}` : ''}`}
                    className="group inline-flex items-center"
                  >
                    Type
                    <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                  </Link>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Link 
                    href={`/dashboard/aircraft?sortBy=model&sortOrder=${sortBy === 'model' && sortOrder === 'asc' ? 'desc' : 'asc'}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}${type ? `&type=${type}` : ''}`}
                    className="group inline-flex items-center"
                  >
                    Model
                    <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                  </Link>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Link 
                    href={`/dashboard/aircraft?sortBy=year&sortOrder=${sortBy === 'year' && sortOrder === 'asc' ? 'desc' : 'asc'}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}${type ? `&type=${type}` : ''}`}
                    className="group inline-flex items-center"
                  >
                    Year
                    <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                  </Link>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Link 
                    href={`/dashboard/aircraft?sortBy=status&sortOrder=${sortBy === 'status' && sortOrder === 'asc' ? 'desc' : 'asc'}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}${type ? `&type=${type}` : ''}`}
                    className="group inline-flex items-center"
                  >
                    Status
                    <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                  </Link>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {typedAircraft && typedAircraft.length > 0 ? (
                typedAircraft.map((aircraft) => (
                  <tr key={aircraft.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <Plane className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <Link 
                            href={`/dashboard/aircraft/${aircraft.id}`}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            {aircraft.registration}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {aircraft.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {aircraft.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {aircraft.year || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(aircraft.status)}`}>
                        {aircraft.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/dashboard/aircraft/${aircraft.id}/edit`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-4"
                      >
                        Edit
                      </Link>
                      <Link 
                        href={`/dashboard/aircraft/${aircraft.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-base font-medium text-gray-900 dark:text-white mb-1">No aircraft found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your search or filters, or add a new aircraft.
                      </p>
                      <div className="mt-4">
                        <Link
                          href="/dashboard/aircraft/new"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Aircraft
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