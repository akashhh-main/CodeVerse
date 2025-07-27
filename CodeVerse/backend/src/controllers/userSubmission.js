const Problem = require("../models/problem");
const Submission = require("../models/submission");
const {
  getLanguageId,
  submitBatch,
  submitToken,
} = require("../utils/problemUtility");






const submitCode = async (req, res) => {
  try {
    const { id: problemId } = req.params;
    const { code, language } = req.body;
    const userId = req.result._id; // From userMiddleware
    // 1. Validate input
    if (!code || !language) {
      return res.status(400).send("Missing required fields");
    }

    // 2. Check if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).send("Problem not found");
    }
    //hidenTestCases we can know about when problem is fetched

    // 3. Create submission record
    const submittedResult = await Submission.create({
      problemId,
      userId,
      code,
      language,
      status: "pending",
      testCasesTotal: problem.hiddenTestCases.length,
    });

    const languageId = getLanguageId(language);
    if (!languageId) {
      return res.status(400).send(`Unsupported language: ${language}`);
    }

    //summission batch created
    const submissions = problem.hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input, // Already space-separated
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);
    if (!submitResult || !submitResult.length) {
      return res.status(500).send("Failed to submit test cases");
    }
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    // Update submitResult
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errorMessage = "";
    for (const test of testResult) {
      if (test.status_id === 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id === 4) {
          status = "wrong";
          errorMessage = test.stderr || "Wrong Answer";
        } else if (test.status_id === 5) {
          status = "timeout";
          errorMessage = test.stderr || "Time Limit Exceeded";
        } else if (test.status_id === 6) {
          status = "compile_error";
          errorMessage = test.compile_output || "Compilation Error";
        } else if (test.status_id === 7) {
          status = "runtime_error_sigsegv";
          errorMessage = test.stderr || "Segmentation Fault (SIGSEGV)";
        } else if (test.status_id === 8) {
          status = "runtime_error_sigxfsz";
          errorMessage = test.stderr || "Output File Too Large (SIGXFSZ)";
        } else if (test.status_id === 9) {
          status = "runtime_error_sigfpe";
          errorMessage = test.stderr || "Floating Point Exception (SIGFPE)";
        } else if (test.status_id === 10) {
          status = "runtime_error_sigabrt";
          errorMessage = test.stderr || "Aborted (SIGABRT)";
        } else if (test.status_id === 11) {
          status = "runtime_error_nzec";
          errorMessage = test.stderr || "Non Zero Exit Code (NZEC)";
        } else if (test.status_id === 12) {
          status = "runtime_error_other";
          errorMessage = test.stderr || "Other Runtime Error";
        } else if (test.status_id === 13) {
          status = "internal_error";
          errorMessage = test.message || "Internal Judge Error";
        } else if (test.status_id === 14) {
          status = "execution_timeout";
          errorMessage = test.stderr || "Execution Timed Out";
        } else {
          status = "unknown_error";
          errorMessage = "Unknown status_id: " + test.status_id;
        }
      }
    }


    //store the result in the database submittedResult
    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;
    submittedResult.errorMessage = errorMessage;
    await submittedResult.save();



    // problem id ko insert krenege userschema ke problemsolved mein if it is not present

     

    if(!req.result.problemSolved.includes(problemId)) {
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    res.status(200).send(submittedResult);
  } catch (err) {
    res.status(500).send("Error in submitting code: " + err.message);
  }
};

const runCode=async(req, res) => {
   try {
    const { id: problemId } = req.params;
    const { code, language } = req.body;
    const userId = req.result._id; // From userMiddleware
    // 1. Validate input
    if (!code || !language || !problemId || !userId) {
      return res.status(400).send("Missing required fields");
    }

    // 2. Check if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).send("Problem not found");
    }
    //hidenTestCases we can know about when problem is fetched

   

    const languageId = getLanguageId(language);
    if (!languageId) {
      return res.status(400).send(`Unsupported language: ${language}`);
    }

    //summission batch created
    const submissions = problem.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input, // Already space-separated
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);
    if (!submitResult || !submitResult.length) {
      return res.status(500).send("Failed to submit test cases");
    }
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

   

    res.status(200).send(testResult);
  } catch (err) {
    res.status(500).send("Error in submitting code: " + err.message);
  }
}



module.exports = { submitCode,runCode};







//     testcases passed increase value when any testcase has statusid 3
//     error message ek hi test case ka show krunga like jab humara code run nhi hota correctly means lags for some test cases then it shows the problem of only one testcase

//     these are some of property that testResult will contain
//     language_id: 54,
//     stdin: '3 2 4\n6',
//     expected_output: '1 2',
//     stdout: '1 2',
//     status_id: 3,
//     created_at: '2025-06-25T01:18:15.103Z',
//     finished_at: '2025-06-25T01:18:15.661Z',
//     time: '0.002',              this is the total time taken by each testcase
//     memory: 1176,               this is the maximum memory used by the program
//     stderr: null,
//     token: 'abea092d-5ca2-4ec5-b525-799070d7f0ef',
