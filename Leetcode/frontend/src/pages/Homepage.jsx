import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseClasses =
    'font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-300 focus:ring-4 focus:outline-none';

  let variantClasses = '';
  switch (variant) {
    case 'secondary':
      variantClasses =
        'text-gray-800 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-gray-200 hover:shadow-md';
      break;
    case 'danger':
      variantClasses =
        'text-white bg-red-500 hover:bg-red-600 focus:ring-red-300 hover:shadow-md hover:-translate-y-0.5';
      break;
    case 'primary':
    default:
      variantClasses =
        'text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-300 hover:shadow-lg hover:-translate-y-0.5';
      break;
  }

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Homepage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [problemsResponse, solvedResponse] = await Promise.all([
        axiosClient.get('/problem/getAllProblem', {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            difficulty: filters.difficulty !== 'all' ? filters.difficulty : undefined,
            tag: filters.tag !== 'all' ? filters.tag : undefined
          }
        }),
        user ? axiosClient.get('/problem/problemSolvedByUser') : Promise.resolve({ data: [] })
      ]);
      
      setProblems(problemsResponse.data.problems);
      setPagination(prev => ({
        ...prev,
        total: problemsResponse.data.totalProblems
      }));
      
      if (user) setSolvedProblems(solvedResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setProblems([]);
      setSolvedProblems([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, pagination.page, pagination.limit, filters.difficulty, filters.tag]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  }, [dispatch]);

  const difficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const difficultyTextColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Filter problems based on current filters
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const difficultyMatch =
        filters.difficulty === 'all' || 
        problem.difficulty.toLowerCase() === filters.difficulty.toLowerCase();

      const tagMatch =
        filters.tag === 'all' || 
        problem.tags.toLowerCase().includes(filters.tag.toLowerCase());

      return difficultyMatch && tagMatch;
    });
  }, [problems, filters]);

  // Separate solved and unsolved problems
  const [solved, unsolved] = useMemo(() => {
    const solvedIds = new Set(solvedProblems.map(sp => sp._id));
    return filteredProblems.reduce((acc, problem) => {
      solvedIds.has(problem._id) ? acc[0].push(problem) : acc[1].push(problem);
      return acc;
    }, [[], []]);
  }, [filteredProblems, solvedProblems]);

  // Determine which problems to show based on active tab
  const problemsToShow = useMemo(() => {
    switch (activeTab) {
      case 'solved':
        return solved;
      case 'unsolved':
        return unsolved;
      case 'all':
      default:
        return filteredProblems;
    }
  }, [activeTab, solved, unsolved, filteredProblems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header with Glass Morphism */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <NavLink to="/" className="flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  LeetCode
                </span>
              </NavLink>
              <nav className="hidden md:ml-10 md:flex md:space-x-8">
                <NavLink
                  to="/"
                  className="text-blue-600 border-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Problems
                </NavLink>
                <NavLink
                  to="/playground"
                  className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                >
                  Playground
                </NavLink>
                <NavLink
                  to="/contests"
                  className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                >
                  Contests
                </NavLink>
              </nav>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center text-sm rounded-full focus:outline-none cursor-pointer transition-all ${
                      isDropdownOpen 
                        ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center text-white font-medium hover:from-blue-700 hover:to-blue-900 transition-colors">
                      {user.firstName.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-2 text-gray-800 font-medium hidden md:inline hover:text-gray-900">
                      {user.firstName}
                    </span>
                    <svg 
                      className={`ml-1 h-5 w-5 text-gray-600 transition-transform ${
                        isDropdownOpen ? 'transform rotate-180 text-blue-600' : 'hover:text-gray-800'
                      }`}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-lg shadow-xl py-1 bg-white border border-gray-200 z-50">
                      <NavLink
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-5 py-3 text-sm font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        Your Profile
                      </NavLink>
                      {user.role === 'admin' && (
                        <NavLink
                          to="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-5 py-3 text-sm font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                        >
                          Admin Panel
                        </NavLink>
                      )}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-5 py-3 text-sm font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <NavLink
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                >
                  Sign in
                </NavLink>
                <NavLink
                  to="/register"
                  className="relative inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <span className="relative">Register</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-xl p-6 mb-8 text-white">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-4">Master Coding Interviews</h1>
            <p className="text-blue-100 mb-6">
              Practice with our hand-picked collection of coding problems, track your progress,
              and get interview-ready with our structured learning paths.
            </p>
            <div className="flex space-x-4">
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-white/20">
                Explore Learning Paths
              </Button>
              <Button variant="primary" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Practice
              </Button>
            </div>
          </div>
        </div>

        {/* Problem List Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-800">Coding Problems</h1>
            <span className="ml-3 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
              {filteredProblems.length} problems
            </span>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-4 text-sm font-medium rounded-md transition-all duration-300 ${activeTab === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All
            </button>
            {user && (
              <>
                <button
                  onClick={() => setActiveTab('solved')}
                  className={`py-2 px-4 text-sm font-medium rounded-md transition-all duration-300 ${activeTab === 'solved' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Solved
                </button>
                <button
                  onClick={() => setActiveTab('unsolved')}
                  className={`py-2 px-4 text-sm font-medium rounded-md transition-all duration-300 ${activeTab === 'unsolved' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Unsolved
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <div className="flex space-x-2">
              {['all', 'easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilters({ ...filters, difficulty: level })}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-300 ${
                    filters.difficulty === level
                      ? level === 'easy'
                        ? 'bg-green-100 text-green-800'
                        : level === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : level === 'hard'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <select
              className="w-full bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={filters.tag}
              onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            >
              <option value="all">All Tags</option>
              <option value="array">Array</option>
              <option value="linked list">Linked List</option>
              <option value="string">String</option>
              <option value="tree">Tree</option>
              <option value="graph">Graph</option>
              <option value="dynamic programming">Dynamic Programming</option>
              <option value="greedy">Greedy</option>
              <option value="backtracking">Backtracking</option>
            </select>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors duration-300">
                Popularity
              </button>
              <button className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors duration-300">
                Difficulty
              </button>
            </div>
          </div>
        </div>

        {/* Problems Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acceptance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : problemsToShow.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {activeTab === 'solved' 
                            ? "No solved problems found"
                            : activeTab === 'unsolved'
                            ? "No unsolved problems found"
                            : "No problems match your filters"}
                        </h3>
                        <p className="text-gray-500 max-w-md text-center">
                          {activeTab === 'solved'
                            ? "You haven't solved any problems yet. Start solving now!"
                            : "Try adjusting your filters or create a new problem."}
                        </p>
                        {activeTab !== 'solved' && (
                          <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Create New Problem
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  problemsToShow.map((problem) => (
                    <tr key={problem._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {solvedProblems.some((sp) => sp._id === problem._id) ? (
                          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <NavLink
                          to={`/problems/${problem._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium group transition-colors duration-300"
                        >
                          {problem.title}
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 group-hover:bg-blue-200 transition-colors duration-300">
                            Premium
                          </span>
                        </NavLink>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap`}>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColor(problem.difficulty)}`}>
                          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.floor(Math.random() * 30) + 70}%
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {problem.tags.split(',').slice(0, 2).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {tag.trim()}
                            </span>
                          ))}
                          {problem.tags.split(',').length > 2 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{problem.tags.split(',').length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && problemsToShow.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button 
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button 
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Dynamic page numbers */}
                    {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) }).map((_, i) => {
                      // Show first 3 pages, current page, and last 2 pages
                      let pageNum;
                      if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= Math.ceil(pagination.total / pagination.limit) - 2) {
                        pageNum = Math.ceil(pagination.total / pagination.limit) - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      if (pageNum > 0 && pageNum <= Math.ceil(pagination.total / pagination.limit)) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.page === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    })}
                    
                    {/* Ellipsis for many pages */}
                    {Math.ceil(pagination.total / pagination.limit) > 5 && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    )}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Problems</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Playground</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Contests</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Interview Prep</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Careers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Privacy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Terms</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Resources</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Guides</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Connect</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Twitter</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Facebook</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">LinkedIn</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">&copy; 2023 CodeMaster. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;