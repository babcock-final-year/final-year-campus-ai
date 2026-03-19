import * as v from "valibot";
import {
	type ClientEnvOutput,
	ClientEnvSchema,
	type ServerEnvOutput,
	ServerEnvSchema,
} from "~/models/env";

let serverEnv: ServerEnvOutput | undefined;

export function getServerEnv(): ServerEnvOutput {
	if (serverEnv) return serverEnv;

	serverEnv = v.parse(ServerEnvSchema, process.env);

	return serverEnv;
}

let clientEnv: ClientEnvOutput | undefined;

export function getClientEnv(): ClientEnvOutput {
	if (clientEnv) return clientEnv;

	clientEnv = v.parse(ClientEnvSchema, import.meta.env);

	return clientEnv;
}
