import mongoose from "mongoose";

async function test() {
  try {
    await mongoose.connect(
      "mongodb://127.0.0.1:27017/ravencrest"
    );

    console.log("✅ Mongoose connected");

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

test();