import Problem from "../models/Problem.js";

const dummyProblems = [
  {
    title: "Two Sum Stream",
    slug: "two-sum-stream",
    description:
      "Given an array of integers and a target, return the indices of the two numbers such that they add up to the target.",
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "nums[0] + nums[1] = 9",
      },
    ],
    inputFormat: "An integer array nums and an integer target.",
    outputFormat: "Return the indices of the two numbers.",
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
        "function twoSum(nums, target) {\n  // write your solution here\n  return [];\n}",
      python:
        "def two_sum(nums, target):\n    # write your solution here\n    return []",
    },
    testCases: [
      { input: "[2,7,11,15], 9", output: "[0,1]", isHidden: false },
      { input: "[3,2,4], 6", output: "[1,2]", isHidden: true },
    ],
  },
  {
    title: "Valid Parentheses Chain",
    slug: "valid-parentheses-chain",
    description:
      "Given a string containing just brackets, determine if the input string is valid.",
    examples: [
      {
        input: 's = "()[]{}"',
        output: "true",
        explanation: "All brackets are matched correctly.",
      },
    ],
    inputFormat: "A string s containing only bracket characters.",
    outputFormat: "Return true if valid, otherwise false.",
    constraints: ["1 <= s.length <= 10^5"],
    difficulty: "easy",
    points: 120,
    tags: ["stack"],
    starterCode: {
      javascript:
        "function isValid(s) {\n  // write your solution here\n  return false;\n}",
      python:
        "def is_valid(s):\n    # write your solution here\n    return False",
    },
    testCases: [{ input: '"()[]{}"', output: "true", isHidden: false }],
  },
  {
    title: "Sliding Window Maximum",
    slug: "sliding-window-maximum",
    description:
      "Return the maximum value in every sliding window of size k.",
    examples: [
      {
        input: "nums = [1,3,-1,-3,5,3,6,7], k = 3",
        output: "[3,3,5,5,6,7]",
        explanation: "Each window contributes its maximum.",
      },
    ],
    inputFormat: "Integer array nums and integer k.",
    outputFormat: "Array of maximums for each window.",
    constraints: ["1 <= nums.length <= 10^5", "1 <= k <= nums.length"],
    difficulty: "hard",
    points: 300,
    tags: ["sliding-window", "queue"],
    starterCode: {
      javascript:
        "function maxSlidingWindow(nums, k) {\n  // write your solution here\n  return [];\n}",
      python:
        "def max_sliding_window(nums, k):\n    # write your solution here\n    return []",
    },
    testCases: [
      {
        input: "[1,3,-1,-3,5,3,6,7], 3",
        output: "[3,3,5,5,6,7]",
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
        input: "[[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        explanation: "Merge the first two overlapping intervals.",
      },
    ],
    inputFormat: "Array of interval pairs.",
    outputFormat: "Merged array of intervals.",
    constraints: ["1 <= intervals.length <= 10^5"],
    difficulty: "medium",
    points: 200,
    tags: ["arrays", "greedy"],
    starterCode: {
      javascript:
        "function mergeIntervals(intervals) {\n  // write your solution here\n  return intervals;\n}",
      python:
        "def merge_intervals(intervals):\n    # write your solution here\n    return intervals",
    },
    testCases: [
      {
        input: "[[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
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
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 is at index 4.",
      },
    ],
    inputFormat: "Sorted integer array nums and integer target.",
    outputFormat: "Index of target or -1.",
    constraints: ["1 <= nums.length <= 10^4"],
    difficulty: "easy",
    points: 100,
    tags: ["binary-search"],
    starterCode: {
      javascript:
        "function search(nums, target) {\n  // write your solution here\n  return -1;\n}",
      python:
        "def search(nums, target):\n    # write your solution here\n    return -1",
    },
    testCases: [{ input: "[-1,0,3,5,9,12], 9", output: "4", isHidden: false }],
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
        "function climbStairs(n) {\n  // write your solution here\n  return 0;\n}",
      python:
        "def climb_stairs(n):\n    # write your solution here\n    return 0",
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
        input: "grid = [[1,1,0],[0,1,0],[1,0,1]]",
        output: "3",
        explanation: "Three separate islands exist.",
      },
    ],
    inputFormat: "A binary grid.",
    outputFormat: "Total number of islands.",
    constraints: ["1 <= m, n <= 300"],
    difficulty: "medium",
    points: 220,
    tags: ["graph"],
    starterCode: {
      javascript:
        "function numIslands(grid) {\n  // write your solution here\n  return 0;\n}",
      python:
        "def num_islands(grid):\n    # write your solution here\n    return 0",
    },
    testCases: [
      {
        input: "[[1,1,0],[0,1,0],[1,0,1]]",
        output: "3",
        isHidden: false,
      },
    ],
  },
  {
    title: "Lowest Common Ancestor",
    slug: "lowest-common-ancestor",
    description:
      "Find the lowest common ancestor of two nodes in a binary tree.",
    examples: [
      {
        input: "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1",
        output: "3",
        explanation: "3 is the first node that has both descendants.",
      },
    ],
    inputFormat: "Binary tree root and two target nodes.",
    outputFormat: "Value of the lowest common ancestor.",
    constraints: ["The number of nodes is in the range [2, 10^5]"],
    difficulty: "medium",
    points: 240,
    tags: ["tree"],
    starterCode: {
      javascript:
        "function lowestCommonAncestor(root, p, q) {\n  // write your solution here\n  return null;\n}",
      python:
        "def lowest_common_ancestor(root, p, q):\n    # write your solution here\n    return None",
    },
    testCases: [
      {
        input: "[3,5,1,6,2,0,8,null,null,7,4], 5, 1",
        output: "3",
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
        input: "tasks = [A,A,A,B,B,B], n = 2",
        output: "8",
        explanation: "Idle slots are needed to satisfy the cooldown.",
      },
    ],
    inputFormat: "Array of task labels and cooldown n.",
    outputFormat: "Minimum intervals required.",
    constraints: ["1 <= tasks.length <= 10^4"],
    difficulty: "medium",
    points: 210,
    tags: ["greedy", "queue"],
    starterCode: {
      javascript:
        "function leastInterval(tasks, n) {\n  // write your solution here\n  return 0;\n}",
      python:
        "def least_interval(tasks, n):\n    # write your solution here\n    return 0",
    },
    testCases: [{ input: "[A,A,A,B,B,B], 2", output: "8", isHidden: false }],
  },
  {
    title: "Word Ladder Steps",
    slug: "word-ladder-steps",
    description:
      "Return the length of the shortest transformation sequence from beginWord to endWord.",
    examples: [
      {
        input: "begin = hit, end = cog, wordList = [hot,dot,dog,lot,log,cog]",
        output: "5",
        explanation: "hit -> hot -> dot -> dog -> cog",
      },
    ],
    inputFormat: "beginWord, endWord, and wordList.",
    outputFormat: "Shortest number of steps.",
    constraints: ["1 <= wordList.length <= 5000"],
    difficulty: "hard",
    points: 320,
    tags: ["graph", "binary-search"],
    starterCode: {
      javascript:
        "function ladderLength(beginWord, endWord, wordList) {\n  // write your solution here\n  return 0;\n}",
      python:
        "def ladder_length(begin_word, end_word, word_list):\n    # write your solution here\n    return 0",
    },
    testCases: [
      {
        input: "hit, cog, [hot,dot,dog,lot,log,cog]",
        output: "5",
        isHidden: false,
      },
    ],
  },
];

const seedProblems = async () => {
  const existingCount = await Problem.countDocuments();

  if (existingCount >= 10) {
    return;
  }

  for (const problem of dummyProblems) {
    await Problem.updateOne(
      { slug: problem.slug },
      { $set: problem },
      { upsert: true },
    );
  }
};

export default seedProblems;
