from pydantic2ts import generate_typescript_defs

generate_typescript_defs(
    "app.schemas", "../../packages/shared-types/types.ts", [], "bunx json-schema-to-typescript"
)
