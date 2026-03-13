import * as v from "valibot";
import { ServerEnvSchema } from "~/models/env";

export const SERVER_ENV = v.parse(ServerEnvSchema, process.env);
