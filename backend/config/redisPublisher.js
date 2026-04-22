import IORedis from "ioredis";

const redis = new IORedis();

export const publishSubmission = async (data) => {
  await redis.publish("submission-result", JSON.stringify(data));
};