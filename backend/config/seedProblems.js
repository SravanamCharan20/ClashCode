import Problem from "../models/Problem.js";

const dummyProblems = [
  {
    title: "Two Sum Stream",
    slug: "two-sum-stream",
    description:
      "Given an array of integers and a target, return the indices of the two numbers such that they add up to the target.",
    examples: [
      {
        input: "4\n2 7 11 15\n9",
        output: "0 1",
        explanation: "The values at indices 0 and 1 add up to 9.",
      },
    ],
    inputFormat: "First line contains n. Second line contains n integers. Third line contains target.",
    outputFormat: "Print the two zero-based indices separated by a space.",
    constraints: [
      "2 <= nums.length <= 10^5",
      "-10^9 <= nums[i], target <= 10^9",
      "Exactly one valid answer exists",
    ],
    difficulty: "easy",
    points: 100,
    tags: ["arrays", "hashing"],
    starterCode: {
      javascript:
        'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim().split(/\\n/);\nconst n = Number(input[0] || 0);\nconst nums = (input[1] || "").trim().split(/\\s+/).filter(Boolean).map(Number);\nconst target = Number(input[2] || 0);\n\n// write your solution here\n\nconsole.log("0 1");',
      python:
        'import sys\n\ndata = sys.stdin.read().strip().splitlines()\nn = int(data[0]) if data else 0\nnums = list(map(int, data[1].split())) if len(data) > 1 and data[1].strip() else []\ntarget = int(data[2]) if len(data) > 2 else 0\n\n# write your solution here\n\nprint("0 1")',
    },
    testCases: [
      { input: "4\n2 7 11 15\n9", output: "0 1", isHidden: false },
      { input: "3\n3 2 4\n6", output: "1 2", isHidden: true },
    ],
  },
  {
    title: "Valid Parentheses Chain",
    slug: "valid-parentheses-chain",
    description:
      "Given a string containing just brackets, determine if the input string is valid.",
    examples: [
      {
        input: "()[]{}",
        output: "true",
        explanation: "All brackets are matched correctly.",
      },
    ],
    inputFormat: "Single line string s containing only bracket characters.",
    outputFormat: "Print true if valid, otherwise false.",
    constraints: ["1 <= s.length <= 10^5"],
    difficulty: "easy",
    points: 120,
    tags: ["stack"],
    starterCode: {
      javascript:
        'const fs = require("fs");\nconst s = fs.readFileSync(0, "utf8").trim();\n\n// write your solution here\n\nconsole.log("true");',
      python:
        'import sys\n\ns = sys.stdin.read().strip()\n\n# write your solution here\n\nprint("true")',
    },
    testCases: [{ input: "()[]{}", output: "true", isHidden: false }],
  },
  {
    title: "Sliding Window Maximum",
    slug: "sliding-window-maximum",
    description:
      "Return the maximum value in every sliding window of size k.",
    examples: [
      {
        input: "8 3\n1 3 -1 -3 5 3 6 7",
        output: "3 3 5 5 6 7",
        explanation: "Each window contributes its maximum.",
      },
    ],
    inputFormat: "First line contains n and k. Second line contains n integers.",
    outputFormat: "Print the window maximums separated by spaces.",
    constraints: ["1 <= nums.length <= 10^5", "1 <= k <= nums.length"],
    difficulty: "hard",
    points: 300,
    tags: ["sliding-window", "queue"],
    starterCode: {
      javascript:
        'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim().split(/\\n/);\nconst [n, k] = (input[0] || "").trim().split(/\\s+/).map(Number);\nconst nums = (input[1] || "").trim().split(/\\s+/).filter(Boolean).map(Number);\n\n// write your solution here\n\nconsole.log("");',
      python:
        'import sys\n\ndata = sys.stdin.read().strip().splitlines()\nn, k = map(int, data[0].split()) if data else (0, 0)\nnums = list(map(int, data[1].split())) if len(data) > 1 and data[1].strip() else []\n\n# write your solution here\n\nprint("")',
    },
    testCases: [
      {
        input: "8 3\n1 3 -1 -3 5 3 6 7",
        output: "3 3 5 5 6 7",
        isHidden: false,
      },
    ],
  },
  {
    title: "Merge Intervals",
    slug: "merge-intervals",
    description:
      "Merge all overlapping intervals and return a sorted result.",
    examples: [
      {
        input: "4\n1 3\n2 6\n8 10\n15 18",
        output: "1 6\n8 10\n15 18",
        explanation: "Merge the first two overlapping intervals.",
      },
    ],
    inputFormat: "First line contains n. Next n lines each contain l and r.",
    outputFormat: "Print each merged interval on a new line.",
    constraints: ["1 <= intervals.length <= 10^5"],
    difficulty: "medium",
    points: 200,
    tags: ["arrays", "greedy"],
    starterCode: {
      javascript:
        'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim().split(/\\n/);\nconst n = Number(input[0] || 0);\nconst intervals = input.slice(1, n + 1).map((line) => line.trim().split(/\\s+/).map(Number));\n\n// write your solution here\n\nconsole.log("");',
      python:
        'import sys\n\ndata = sys.stdin.read().strip().splitlines()\nn = int(data[0]) if data else 0\nintervals = [list(map(int, line.split())) for line in data[1:n+1]]\n\n# write your solution here\n\nprint("")',
    },
    testCases: [
      {
        input: "4\n1 3\n2 6\n8 10\n15 18",
        output: "1 6\n8 10\n15 18",
        isHidden: false,
      },
    ],
  },
  {
    title: "Binary Search Answer",
    slug: "binary-search-answer",
    description:
      "Find the target index in a sorted array using binary search.",
    examples: [
      {
        input: "6\n-1 0 3 5 9 12\n9",
        output: "4",
        explanation: "9 is at index 4.",
      },
    ],
    inputFormat: "First line contains n. Second line contains sorted integers. Third line contains target.",
    outputFormat: "Print the index of target or -1.",
    constraints: ["1 <= nums.length <= 10^4"],
    difficulty: "easy",
    points: 100,
    tags: ["binary-search"],
    starterCode: {
      javascript:
        'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim().split(/\\n/);\nconst n = Number(input[0] || 0);\nconst nums = (input[1] || "").trim().split(/\\s+/).filter(Boolean).map(Number);\nconst target = Number(input[2] || 0);\n\n// write your solution here\n\nconsole.log(-1);',
      python:
        'import sys\n\ndata = sys.stdin.read().strip().splitlines()\nn = int(data[0]) if data else 0\nnums = list(map(int, data[1].split())) if len(data) > 1 and data[1].strip() else []\ntarget = int(data[2]) if len(data) > 2 else 0\n\n# write your solution here\n\nprint(-1)',
    },
    testCases: [{ input: "6\n-1 0 3 5 9 12\n9", output: "4", isHidden: false }],
  },
  {
    title: "Climb Stairs DP",
    slug: "climb-stairs-dp",
    description:
      "Count how many distinct ways you can climb to the top of a staircase.",
    examples: [
      {
        input: "n = 4",
        output: "5",
        explanation: "There are 5 distinct ways to reach step 4.",
      },
    ],
    inputFormat: "Single integer n.",
    outputFormat: "Number of distinct ways.",
    constraints: ["1 <= n <= 45"],
    difficulty: "easy",
    points: 120,
    tags: ["dp"],
    starterCode: {
      javascript:
        'const fs = require("fs");\nconst n = Number(fs.readFileSync(0, "utf8").trim() || 0);\n\n// write your solution here\n\nconsole.log(0);',
      python:
        'import sys\n\nn = int(sys.stdin.read().strip() or 0)\n\n# write your solution here\n\nprint(0)',
    },
    testCases: [{ input: "4", output: "5", isHidden: false }],
  },
  {
    title: "Island Count",
    slug: "island-count",
    description:
      "Count the number of islands in a binary grid using DFS or BFS.",
    examples: [
      {
        input: "3 3\n1 1 0\n0 1 0\n1 0 1",
        output: "3",
        explanation: "Three separate islands exist.",
      },
    ],
    inputFormat: "First line contains n and m. Next n lines contain the grid values.",
    outputFormat: "Print the number of islands.",
    constraints: ["1 <= m, n <= 300"],
    difficulty: "medium",
    points: 220,
    tags: ["graph"],
    starterCode: {
      javascript:
        'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim().split(/\\n/);\nconst [n, m] = (input[0] || "").trim().split(/\\s+/).map(Number);\nconst grid = input.slice(1, n + 1).map((line) => line.trim().split(/\\s+/).map(Number));\n\n// write your solution here\n\nconsole.log(0);',
      python:
        'import sys\n\ndata = sys.stdin.read().strip().splitlines()\nn, m = map(int, data[0].split()) if data else (0, 0)\ngrid = [list(map(int, line.split())) for line in data[1:n+1]]\n\n# write your solution here\n\nprint(0)',
    },
    testCases: [
      {
        input: "3 3\n1 1 0\n0 1 0\n1 0 1",
        output: "3",
        isHidden: false,
      },
    ],
  },
  {
    title: "Longest Consecutive Sequence",
    slug: "lowest-common-ancestor",
    description:
      "Return the length of the longest consecutive elements sequence in an unsorted array.",
    examples: [
      {
        input: "6\n100 4 200 1 3 2",
        output: "4",
        explanation: "The longest consecutive sequence is [1,2,3,4], so the answer is 4.",
      },
    ],
    inputFormat: "First line contains n. Second line contains n integers.",
    outputFormat: "Length of the longest consecutive sequence.",
    constraints: ["0 <= nums.length <= 10^5"],
    difficulty: "medium",
    points: 240,
    tags: ["arrays", "hashing"],
    starterCode: {
      javascript:
        'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim().split(/\\n/);\nconst n = Number(input[0] || 0);\nconst nums = (input[1] || "").trim().split(/\\s+/).filter(Boolean).map(Number);\n\n// write your solution here\n\nconsole.log(0);',
      python:
        'import sys\n\ndata = sys.stdin.read().strip().splitlines()\nn = int(data[0]) if data else 0\nnums = list(map(int, data[1].split())) if len(data) > 1 and data[1].strip() else []\n\n# write your solution here\n\nprint(0)',
    },
    testCases: [
      {
        input: "6\n100 4 200 1 3 2",
        output: "4",
        isHidden: false,
      },
    ],
  },
  {
    title: "Task Scheduler",
    slug: "task-scheduler",
    description:
      "Given tasks and a cooldown period, find the minimum time needed to execute all tasks.",
    examples: [
      {
        input: "6\nA A A B B B\n2",
        output: "8",
        explanation: "Idle slots are needed to satisfy the cooldown.",
      },
    ],
    inputFormat: "First line contains n. Second line contains task labels. Third line contains cooldown.",
    outputFormat: "Minimum intervals required.",
    constraints: ["1 <= tasks.length <= 10^4"],
    difficulty: "medium",
    points: 210,
    tags: ["greedy", "queue"],
    starterCode: {
      javascript:
        'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim().split(/\\n/);\nconst n = Number(input[0] || 0);\nconst tasks = (input[1] || "").trim().split(/\\s+/).filter(Boolean);\nconst cooldown = Number(input[2] || 0);\n\n// write your solution here\n\nconsole.log(0);',
      python:
        'import sys\n\ndata = sys.stdin.read().strip().splitlines()\nn = int(data[0]) if data else 0\ntasks = data[1].split() if len(data) > 1 and data[1].strip() else []\ncooldown = int(data[2]) if len(data) > 2 else 0\n\n# write your solution here\n\nprint(0)',
    },
    testCases: [
      { input: "6\nA A A B B B\n2", output: "8", isHidden: false },
    ],
  },
  {
    title: "Word Ladder Steps",
    slug: "word-ladder-steps",
    description:
      "Return the length of the shortest transformation sequence from beginWord to endWord.",
    examples: [
      {
        input: "hit\ncog\n6\nhot dot dog lot log cog",
        output: "5",
        explanation: "hit -> hot -> dot -> dog -> cog",
      },
    ],
    inputFormat: "First line beginWord. Second line endWord. Third line n. Fourth line contains n words.",
    outputFormat: "Shortest number of steps.",
    constraints: ["1 <= wordList.length <= 5000"],
    difficulty: "hard",
    points: 320,
    tags: ["graph", "binary-search"],
    starterCode: {
      javascript:
        'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim().split(/\\n/);\nconst beginWord = input[0] || "";\nconst endWord = input[1] || "";\nconst n = Number(input[2] || 0);\nconst wordList = (input[3] || "").trim().split(/\\s+/).filter(Boolean);\n\n// write your solution here\n\nconsole.log(0);',
      python:
        'import sys\n\ndata = sys.stdin.read().strip().splitlines()\nbegin_word = data[0] if len(data) > 0 else ""\nend_word = data[1] if len(data) > 1 else ""\nn = int(data[2]) if len(data) > 2 else 0\nword_list = data[3].split() if len(data) > 3 and data[3].strip() else []\n\n# write your solution here\n\nprint(0)',
    },
    testCases: [
      {
        input: "hit\ncog\n6\nhot dot dog lot log cog",
        output: "5",
        isHidden: false,
      },
    ],
  },
];

const seedProblems = async () => {
  for (const problem of dummyProblems) {
    await Problem.updateOne(
      { slug: problem.slug },
      { $set: problem },
      { upsert: true },
    );
  }
};

export default seedProblems;
