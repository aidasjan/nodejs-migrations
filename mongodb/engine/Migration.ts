import mongoose, { Schema, Document } from "mongoose";

export interface IMigration extends Document {
  fileName: string;
};

const migrationSchema = new Schema({
  fileName: String,
});

export default mongoose.model<IMigration>("Migration", migrationSchema);
