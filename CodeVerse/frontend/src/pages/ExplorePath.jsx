import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const learningPaths = [
  {
    id: 1,
    title: 'Frontend Developer',
    description: 'Master HTML, CSS, JavaScript and modern frameworks like React',
    duration: '3 months',
    level: 'Beginner to Advanced',
    courses: 12,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    progress: 0,
    tags: ['HTML', 'CSS', 'JavaScript', 'React']
  },
  {
    id: 2,
    title: 'Backend Developer',
    description: 'Learn server-side programming with Node.js, Python and databases',
    duration: '4 months',
    level: 'Intermediate',
    courses: 15,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    progress: 0,
    tags: ['Node.js', 'Python', 'SQL', 'APIs']
  },
  {
    id: 3,
    title: 'Data Structures & Algorithms',
    description: 'Essential computer science concepts for technical interviews',
    duration: '2 months',
    level: 'All Levels',
    courses: 8,
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    progress: 0,
    tags: ['Algorithms', 'Problem Solving', 'Interview Prep']
  },
  {
    id: 4,
    title: 'Full Stack Developer',
    description: 'Complete journey from frontend to backend development',
    duration: '6 months',
    level: 'Beginner to Advanced',
    courses: 20,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    progress: 0,
    tags: ['React', 'Node.js', 'MongoDB', 'Full Stack']
  },
  {
    id: 5,
    title: 'Mobile Developer',
    description: 'Build cross-platform efficient and high-level mobile apps using React Native',
    duration: '3 months',
    level: 'Intermediate',
    courses: 10,
    image: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    progress: 0,
    tags: ['React Native', 'iOS', 'Android', 'Mobile']
  },
  {
    id: 6,
    title: 'DevOps Engineer',
    description: 'Learn CI/CD, Docker, Kubernetes and cloud deployment',
    duration: '4 months',
    level: 'Advanced',
    courses: 14,
    image: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    progress: 0,
    tags: ['Docker', 'AWS', 'CI/CD', 'Infrastructure']
  }
];

const ExploreLearningPaths = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredPaths = learningPaths.filter(path => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'in-progress' && path.progress > 0) ||
      (activeFilter === 'not-started' && path.progress === 0);
    
    if (searchQuery.trim() === '') {
      return matchesFilter;
    }
    
    const query = searchQuery.toLowerCase();
    return matchesFilter && (
      path.title.toLowerCase().includes(query) ||
      path.description.toLowerCase().includes(query) ||
      path.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group mb-4 cursor-pointer border border-gray-300 rounded-3xl px-4 py-2 hover:bg-gray-100 transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-blue-700 group-hover:text-blue-600 transition-colors"
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            <span className="font-semibold text-blue-700">Back to Home</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Explore Learning Paths</h1>
          <p className="text-gray-600 mt-2">
            Structured roadmaps to guide your learning journey. Coming soon!
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex space-x-2 overflow-x-auto pb-2 w-full md:w-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Paths
            </button>
            <button
              onClick={() => setActiveFilter('in-progress')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'in-progress' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveFilter('not-started')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'not-started' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Not Started
            </button>
          </div>
          
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search paths..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Learning Paths Grid */}
        {filteredPaths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPaths.map((path) => (
              <div key={path.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  <img 
                    src={path.image} 
                    alt={path.title} 
                    className="w-full h-48 object-cover"
                  />
                  {path.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-2">
                      <div 
                        className="bg-green-500 h-2 transition-all duration-300" 
                        style={{ width: `${path.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{path.title}</h2>
                    {path.progress > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {path.progress}% Complete
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{path.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {path.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>{path.duration}</span>
                    <span>{path.courses} courses</span>
                    <span>{path.level}</span>
                  </div>
                  
                  <button
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-500 cursor-not-allowed transition-colors"
                    disabled
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No learning paths found</h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreLearningPaths;