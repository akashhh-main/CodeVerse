const { getLanguageId, submitBatch, submitToken } = require('../utils/problemUtility');
const Problem = require('../models/problem');
const User= require('../models/user');

const createProblem = async (req, res) => {
    const { title, description, difficulty, tags, visibleTestCases, 
        hiddenTestCases, startCode, referenceSolution } = req.body;

    if (!req.result?._id) {
        return res.status(401).send("Unauthorized");
    }

    try {
        // Validate all reference solutions
        for (const { language, completeCode } of referenceSolution) {
            const languageId = getLanguageId(language);
            if (!languageId) {
                return res.status(400).send(`Unsupported language: ${language}`);
            }
    const submissions = visibleTestCases.map(testcase => ({
    source_code: completeCode,
    language_id: languageId,
    stdin: testcase.input, // Already space-separated
    expected_output: testcase.output
     }));

            // Submit batch with error handling
            const submitResult = await submitBatch(submissions);
            if (!submitResult || !submitResult.length) {
                return res.status(500).send("Failed to submit test cases");
            }

            const resultToken = submitResult.map(value => value.token);
            const testResult = await submitToken(resultToken);
            console.log(testResult);
            // Check all test results
            for (const test of testResult) {
                if (test.status.id !== 3) {  // 3 means "Accepted"
                    return res.status(400).send({
                        message: "Test case failed",
                        testResult: testResult,
                        expectedOutput: test.expected_output,
                        actualOutput: test.stdout
                    });
                }
            }
        }

        // Create problem in database
        const userProblem = await Problem.create({
            title,
            description,
            difficulty,
            tags,
            visibleTestCases,
            hiddenTestCases,
            startCode,
            referenceSolution,
            problemCreator: req.result._id
        });

        res.status(201).json({
            message: "Problem saved successfully",
            problemId: userProblem._id
        });
    } catch (err) {
        console.error("Error creating problem:", err);
        res.status(500).json({
            message: "Error creating problem",
            error: err.message
        });
    }
}


const updateProblem= async(req, res) => {
  const {id}=req.params;
  const { title, description, difficulty, tags, visibleTestCases, 
        hiddenTestCases, startCode, referenceSolution } = req.body;
        if(!req.result?._id) {
        return res.status(401).send("Unauthorized");
    }

  try{
    if(!id) {
       return res.status(400).send("Problem id is required");
    }
    const DsaProblem = await Problem.findById(id);
    if(!DsaProblem) {
        return res.status(400).send("Problem not found");
    }
    
   for (const { language, completeCode } of referenceSolution) {
            const languageId = getLanguageId(language);
            if (!languageId) {
                return res.status(400).send(`Unsupported language: ${language}`);
            }
    const submissions = visibleTestCases.map(testcase => ({
    source_code: completeCode,
    language_id: languageId,
    stdin: testcase.input, // Already space-separated
    expected_output: testcase.output
     }));

            // Submit batch with error handling
            const submitResult = await submitBatch(submissions);
            if (!submitResult || !submitResult.length) {
                return res.status(500).send("Failed to submit test cases");
            }

            const resultToken = submitResult.map(value => value.token);
            const testResult = await submitToken(resultToken);
            
            // Check all test results
            for (const test of testResult) {
                if (test.status.id !== 3) {  // 3 means "Accepted"
                    return res.status(400).send({
                        message: "Test case failed",
                        testResult: testResult,
                        expectedOutput: test.expected_output,
                        actualOutput: test.stdout
                    });
                }
            }
        }
        // verified question that has to be updated is valid or not 
        await Problem.findByIdAndUpdate(id, {
            title,
            description,
            difficulty,
            tags,
            visibleTestCases,
            hiddenTestCases,
            startCode,
            referenceSolution,
            problemCreator: req.result._id
        },{runValidators: true,new: true});
       
       
        res.status(200).send("Problem updated successfully");

        
  }catch(err){
  res.status(404).send("Error in updating problem: " + err.message);
  }
}

const deleteProblem= async(req, res) => {
  const {id}=req.params;
   if(!req.result?._id) {
        return res.status(401).send("Unauthorized");
    }
  try{
    if(!id) {
        return res.status(400).send("Problem id is required");
    }
   const deleteProblem= await Problem.findByIdAndDelete(id);
   if(!deleteProblem) {
    return res.status(400).send("Problem not found");
   }
    res.status(200).send("Problem deleted successfully");
  }catch(err){
   res.status(500).send("Error in deleting problem: " + err.message);
  }
}

const getProblemById=async(req, res) => {
    const{id}=req.params;
  try{
    if(!id) {
        return res.status(400).send("Problem id is required");
    }
   const getProblem=await Problem.findById(id).select('_id title description difficulty tags visibleTestCases  startCode');
   if(!getProblem) {
    return res.status(400).send("Problem not found");
   }
    res.status(200).send(getProblem);
  }catch(err){
    res.status(500).send("Error in getting all problem: " + err.message);
  }
}


const getAllProblem = async (req, res) => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Add difficulty filter if provided
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }
    
    // Add tags filter if provided
    if (req.query.tags) {
      filter.tags = req.query.tags;
    }
    
    // Add search by title if provided
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    // Get total count for pagination info
    const totalProblems = await Problem.countDocuments(filter);
    
    // Get paginated problems
    const problems = await Problem.find(filter)
      .select('_id title difficulty tags')
      .skip(skip)
      .limit(limit);

    if (problems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No problems found matching your criteria'
      });
    }

    res.status(200).json({
      success: true,
      totalProblems,
      page,
      totalPages: Math.ceil(totalProblems / limit),
      problems
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error in getting problems',
      error: err.message
    });
  }
};


const allProblemSolvedByUser=async(req, res) => {
  try{
   const userId= req.result._id;
   const user = await User.findById(userId).populate({
    path: 'problemSolved',
    select: ' _id title difficulty tags', // Select only the '_id' and title'
   });
  //  const questionSolved=[];
  //  for(let i = 0; i < user.problemSolved.length; i++) {
  //   questionSolved.push(user.problemSolved[i].title);
  //  }  this will provide only title name of questions solved by user
    res.status(200).send(user.problemSolved);
  }catch(err){
    res.status(500).send("Error in getting all problem: " + err.message);
  }
}

const submittedProblem=async(req, res) => {
  try{
   const userId=req.result._id;
   const problemId=req.params.pid;
   const ans=await Submission.find({problemId,userId})
   if(ans.length===0) {
    return res.status(400).send("NO submission found");
   }
   res.status(200).send(ans);

  }catch(err){
    res.status(500).send("Error in getting all problem: " + err.message);
  }
}

module.exports = {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,allProblemSolvedByUser,submittedProblem};