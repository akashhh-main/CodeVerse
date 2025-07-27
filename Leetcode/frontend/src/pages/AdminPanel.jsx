import { useForm, useFieldArray, } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';

// Updated Zod schema to match Mongoose schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required').min(20, 'Description should be at least 20 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum([
    'array', 
    'string', 
    'linked list', 
    'tree', 
    'graph', 
    'dynamic programming', 
    'greedy', 
    'backtracking'
  ]),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      inputDisplay: z.string().min(1, 'Input display is required'),
      output: z.string().min(1, 'Output is required'),
      outputDisplay: z.string().min(1, 'Output display is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.string().min(1, 'Language is required'),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).min(1, 'At least one start code required'),
  referenceSolution: z.array(
    z.object({
      language: z.string().min(1, 'Language is required'),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).min(1, 'At least one reference solution required')
});

// Supported languages for code templates
const SUPPORTED_LANGUAGES = [
  'javascript',
  'python',
  'java',
  'c++',
  'c',
  'c#',
  'ruby',
  'swift',
  'go',
  'typescript'
];

const difficultyColors = {
  easy: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  hard: 'bg-rose-100 text-rose-800'
};

function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      difficulty: 'medium',
      tags: 'array',
      visibleTestCases: [{ 
        input: '', 
        inputDisplay: '', 
        output: '', 
        outputDisplay: '', 
        explanation: '' 
      }],
      hiddenTestCases: [{ input: '', output: '' }],
      startCode: [{ language: 'javascript', initialCode: '' }],
      referenceSolution: [{ language: 'javascript', completeCode: '' }]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const {
    fields: startCodeFields,
    append: appendStartCode,
    remove: removeStartCode
  } = useFieldArray({
    control,
    name: 'startCode'
  });

  const {
    fields: referenceSolutionFields,
    append: appendReferenceSolution,
    remove: removeReferenceSolution
  } = useFieldArray({
    control,
    name: 'referenceSolution'
  });

  const onSubmit = async (data) => {
    try {
      // Add the problem creator (current user) to the data
      const problemData = {
        ...data,
        problemCreator: user._id
      };
      
      await axiosClient.post('/problem/create', problemData);
      alert('Problem created successfully!');
      navigate('/admin');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/')}
          className="btn btn-ghost mr-4"
        >
          &larr; Back
        </button>
        <h1 className="text-3xl font-bold text-white">Create New Problem</h1>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="card bg-white shadow-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full mr-3"></div>
            <h2 className="text-2xl font-semibold text-gray-800">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">Title*</span>
              </label>
              <input
                {...register('title')}
                placeholder="Problem title"
                className={`input input-bordered w-full ${errors.title ? 'input-error' : 'focus:ring-2 focus:ring-blue-500'}`}
              />
              {errors.title && (
                <span className="text-error text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.title.message}
                </span>
              )}
            </div>

            <div className="flex gap-4">
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text font-medium text-gray-700">Difficulty*</span>
                </label>
                <select
                  {...register('difficulty')}
                  className={`select select-bordered w-full ${errors.difficulty ? 'select-error' : 'focus:ring-2 focus:ring-blue-500'}`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text font-medium text-gray-700">Category*</span>
                </label>
                <select
                  {...register('tags')}
                  className={`select select-bordered w-full ${errors.tags ? 'select-error' : 'focus:ring-2 focus:ring-blue-500'}`}
                >
                  <option value="array">Array</option>
                  <option value="string">String</option>
                  <option value="linked list">Linked List</option>
                  <option value="tree">Tree</option>
                  <option value="graph">Graph</option>
                  <option value="dynamic programming">Dynamic Programming</option>
                  <option value="greedy">Greedy</option>
                  <option value="backtracking">Backtracking</option>
                </select>
              </div>
            </div>
              <label className="label">
                <span className="label-text font-medium text-gray-700">Description*</span>
              </label>
            <div className="col-span-full  form-control ">
            
              <textarea
                {...register('description')}
                placeholder="Detailed problem description with examples and constraints"
                className={`textarea textarea-bordered h-56 w-full ${errors.description ? 'textarea-error' : 'focus:ring-2 focus:ring-blue-500'}`}
              />
              {errors.description && (
                <span className="text-error text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.description.message}
                </span>
              )}
             
            </div>
             
          </div>
          <label className="label justify-center">
                <span className="label-text-alt text-gray-500">Markdown is supported</span>
              </label>
        </div>

        {/* Test Cases */}
        <div className="card bg-white shadow-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-1.5 h-8 bg-purple-600 rounded-full mr-3"></div>
            <h2 className="text-2xl font-semibold text-gray-800">Test Cases</h2>
          </div>
          
          {/* Visible Test Cases */}
          <div className="space-y-6 mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-gray-700">Visible Test Cases*</h3>
              <button
                type="button"
                onClick={() => appendVisible({ 
                  input: '', 
                  inputDisplay: '', 
                  output: '', 
                  outputDisplay: '', 
                  explanation: '' 
                })}
                className="btn btn-sm btn-primary gap-1"
              >
                <FiPlus className="w-4 h-4" />
                Add Case
              </button>
            </div>
            
            <div className="space-y-5">
              {visibleFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 p-5 rounded-xl space-y-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700">Test Case {index + 1}</span>
                      {errors.visibleTestCases?.[index] && (
                        <span className="text-error text-sm ml-3 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Some fields are missing
                        </span>
                      )}
                    </div>
                    {visibleFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVisible(index)}
                        className="btn btn-xs btn-error gap-1"
                      >
                        <FiTrash2 className="w-3 h-3" />
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-gray-600">Input (JSON)*</span>
                      </label>
                      <div className="relative">
                        <textarea
                          {...register(`visibleTestCases.${index}.input`)}
                          placeholder="Actual input for testing"
                          className={`textarea textarea-bordered w-full font-mono text-sm ${errors.visibleTestCases?.[index]?.input ? 'textarea-error' : 'focus:ring-2 focus:ring-blue-500'}`}
                          rows={5}
                        />
                      </div>
                      {errors.visibleTestCases?.[index]?.input && (
                        <span className="text-error text-sm mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.visibleTestCases[index].input.message}
                        </span>
                      )}
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-gray-600">Input Display*</span>
                      </label>
                      <textarea
                        {...register(`visibleTestCases.${index}.inputDisplay`)}
                        placeholder="How input should be displayed to users"
                        className={`textarea textarea-bordered w-full font-mono text-sm ${errors.visibleTestCases?.[index]?.inputDisplay ? 'textarea-error' : 'focus:ring-2 focus:ring-blue-500'}`}
                        rows={5}
                      />
                      {errors.visibleTestCases?.[index]?.inputDisplay && (
                        <span className="text-error text-sm mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.visibleTestCases[index].inputDisplay.message}
                        </span>
                      )}
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-gray-600">Output (JSON)*</span>
                      </label>
                      <textarea
                        {...register(`visibleTestCases.${index}.output`)}
                        placeholder="Expected output"
                        className={`textarea textarea-bordered w-full font-mono text-sm ${errors.visibleTestCases?.[index]?.output ? 'textarea-error' : 'focus:ring-2 focus:ring-blue-500'}`}
                        rows={5}
                      />
                      {errors.visibleTestCases?.[index]?.output && (
                        <span className="text-error text-sm mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.visibleTestCases[index].output.message}
                        </span>
                      )}
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-gray-600">Output Display*</span>
                      </label>
                      <textarea
                        {...register(`visibleTestCases.${index}.outputDisplay`)}
                        placeholder="How output should be displayed to users"
                        className={`textarea textarea-bordered w-full font-mono text-sm ${errors.visibleTestCases?.[index]?.outputDisplay ? 'textarea-error' : 'focus:ring-2 focus:ring-blue-500'}`}
                        rows={5}
                      />
                      {errors.visibleTestCases?.[index]?.outputDisplay && (
                        <span className="text-error text-sm mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.visibleTestCases[index].outputDisplay.message}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-600">Explanation*</span>
                    </label>
                    <textarea
                      {...register(`visibleTestCases.${index}.explanation`)}
                      placeholder="Detailed explanation of the test case"
                      className={`textarea textarea-bordered w-full ${errors.visibleTestCases?.[index]?.explanation ? 'textarea-error' : 'focus:ring-2 focus:ring-blue-500'}`}
                      rows={8}
                    />
                    {errors.visibleTestCases?.[index]?.explanation && (
                      <span className="text-error text-sm mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.visibleTestCases[index].explanation.message}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.visibleTestCases && (
              <div className="alert alert-error shadow-lg">
                <div>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.visibleTestCases.message}</span>
                </div>
              </div>
            )}
          </div>

          {/* Hidden Test Cases */}
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-gray-700">Hidden Test Cases*</h3>
              <button
                type="button"
                onClick={() => appendHidden({ input: '', output: '' })}
                className="btn btn-sm btn-primary gap-1"
              >
                <FiPlus className="w-4 h-4" />
                Add Case
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
              {hiddenFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 p-5 rounded-xl space-y-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700">Hidden Case {index + 1}</span>
                      {errors.hiddenTestCases?.[index] && (
                        <span className="text-error text-sm ml-3 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Some fields are missing
                        </span>
                      )}
                    </div>
                    {hiddenFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHidden(index)}
                        className="btn btn-xs btn-error gap-1"
                      >
                        <FiTrash2 className="w-3 h-3" />
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-600">Input (JSON)*</span>
                    </label>
                    <textarea
                      {...register(`hiddenTestCases.${index}.input`)}
                      placeholder="Input for hidden test case"
                      className={`textarea textarea-bordered w-full font-mono text-sm ${errors.hiddenTestCases?.[index]?.input ? 'textarea-error' : 'focus:ring-2 focus:ring-blue-500'}`}
                      rows={5}
                    />
                    {errors.hiddenTestCases?.[index]?.input && (
                      <span className="text-error text-sm mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.hiddenTestCases[index].input.message}
                      </span>
                    )}
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-600">Output (JSON)*</span>
                    </label>
                    <textarea
                      {...register(`hiddenTestCases.${index}.output`)}
                      placeholder="Expected output"
                      className={`textarea textarea-bordered w-full font-mono text-sm ${errors.hiddenTestCases?.[index]?.output ? 'textarea-error' : 'focus:ring-2 focus:ring-blue-500'}`}
                      rows={5}
                    />
                    {errors.hiddenTestCases?.[index]?.output && (
                      <span className="text-error text-sm mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.hiddenTestCases[index].output.message}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.hiddenTestCases && (
              <div className="alert alert-error shadow-lg">
                <div>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.hiddenTestCases.message}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code Templates */}
        <div className="card bg-white shadow-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-1.5 h-8 bg-green-600 rounded-full mr-3"></div>
            <h2 className="text-2xl font-semibold text-gray-800">Code Templates</h2>
          </div>
          
          {/* Start Code */}
          <div className="space-y-8 mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-gray-700">Initial Code Templates*</h3>
              <button
                type="button"
                onClick={() => appendStartCode({ language: 'javascript', initialCode: '' })}
                className="btn btn-sm btn-primary gap-1"
              >
                <FiPlus className="w-4 h-4" />
                Add Language
              </button>
            </div>
            
            <div className="space-y-6">
              {startCodeFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 p-5 rounded-xl bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="form-control w-full max-w-xs">
                      <label className="label">
                        <span className="label-text font-medium text-gray-600">Language*</span>
                      </label>
                      <select
                        {...register(`startCode.${index}.language`)}
                        className={`select select-bordered w-full ${errors.startCode?.[index]?.language ? 'select-error' : 'focus:ring-2 focus:ring-blue-500'}`}
                      >
                        {SUPPORTED_LANGUAGES.map(lang => (
                          <option key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {startCodeFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStartCode(index)}
                        className="btn btn-xs btn-error gap-1 mt-8"
                      >
                        <FiTrash2 className="w-3 h-3" />
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-600">Initial Code*</span>
                    </label>
                    <div className="mockup-code bg-gray-800 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-gray-700 flex justify-between items-center">
                        <span className="text-gray-300 text-sm font-mono">
                         Starter Code
                        </span>
                        <div className="flex space-x-2">
                          <button type="button" className="text-gray-400 hover:text-white">
                            <FiChevronUp className="w-4 h-4" />
                          </button>
                          <button type="button" className="text-gray-400 hover:text-white">
                            <FiChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <pre className="p-4">
                        <textarea
                          {...register(`startCode.${index}.initialCode`)}
                          className="w-full bg-transparent font-mono text-sm text-white resize-none"
                          rows={8}
                          spellCheck="false"
                        />
                      </pre>
                    </div>
                    {errors.startCode?.[index]?.initialCode && (
                      <span className="text-error text-sm mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.startCode[index].initialCode.message}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.startCode && (
              <div className="alert alert-error shadow-lg">
                <div>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.startCode.message}</span>
                </div>
              </div>
            )}
          </div>

          {/* Reference Solution */}
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-gray-700">Reference Solutions*</h3>
              <button
                type="button"
                onClick={() => appendReferenceSolution({ language: 'javascript', completeCode: '' })}
                className="btn btn-sm btn-primary gap-1"
              >
                <FiPlus className="w-4 h-4" />
                Add Language
              </button>
            </div>
            
            <div className="space-y-6">
              {referenceSolutionFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 p-5 rounded-xl bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="form-control w-full max-w-xs">
                      <label className="label">
                        <span className="label-text font-medium text-gray-600">Language*</span>
                      </label>
                      <select
                        {...register(`referenceSolution.${index}.language`)}
                        className={`select select-bordered w-full ${errors.referenceSolution?.[index]?.language ? 'select-error' : 'focus:ring-2 focus:ring-blue-500'}`}
                      >
                        {SUPPORTED_LANGUAGES.map(lang => (
                          <option key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {referenceSolutionFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReferenceSolution(index)}
                        className="btn btn-xs btn-error gap-1 mt-8"
                      >
                        <FiTrash2 className="w-3 h-3" />
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-600">Complete Solution*</span>
                    </label>
                    <div className="mockup-code bg-gray-800 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-gray-700 flex justify-between items-center">
                        <span className="text-gray-300 text-sm font-mono">
                          Complete Solution
                        </span>
                        <div className="flex space-x-2">
                          <button type="button" className="text-gray-400 hover:text-white">
                            <FiChevronUp className="w-4 h-4" />
                          </button>
                          <button type="button" className="text-gray-400 hover:text-white">
                            <FiChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <pre className="p-4">
                        <textarea
                          {...register(`referenceSolution.${index}.completeCode`)}
                          className="w-full bg-transparent font-mono text-sm text-white resize-none"
                          rows={10}
                          spellCheck="false"
                        />
                      </pre>
                    </div>
                    {errors.referenceSolution?.[index]?.completeCode && (
                      <span className="text-error text-sm mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.referenceSolution[index].completeCode.message}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.referenceSolution && (
              <div className="alert alert-error shadow-lg">
                <div>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.referenceSolution.message}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/admin')}
            className="btn btn-ghost hover:bg-gray-100"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary px-8"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner"></span>
                Creating...
              </>
            ) : 'Create Problem'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminPanel;