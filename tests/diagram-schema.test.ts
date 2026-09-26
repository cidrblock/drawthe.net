import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import Ajv from "ajv";
import { load } from "js-yaml";

const repositoryRoot = process.cwd();
const schema = JSON.parse(readFileSync(join(repositoryRoot, "src/editor/diagram.schema.json"), "utf8"));
const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);

test("all bundled examples and templates satisfy the editor schema", () => {
  for (const directory of ["examples", "templates"]) {
    for (const file of readdirSync(join(repositoryRoot, directory)).filter((name) => name.endsWith(".yaml"))) {
      const document = load(readFileSync(join(repositoryRoot, directory, file), "utf8"));
      assert.equal(validate(document), true, `${directory}/${file}: ${JSON.stringify(validate.errors)}`);
    }
  }
});

test("the schema validates known fields while permitting YAML default anchors", () => {
  const document = load(`
diagram:
  rows: 3
  columns: 3
iconDefaults: &iconDefaults
  iconFamily: cisco
  icon: router
icons:
  first: {<<: *iconDefaults, x: 1, y: 1}
  second: {<<: *iconDefaults, x: "+1", y: 1}
`);
  assert.equal(validate(document), true, JSON.stringify(validate.errors));
});

test("the schema reports invalid known property types and enum values", () => {
  assert.equal(validate({ diagram: { rows: "many" } }), false);
  assert.equal(validate({ title: { type: "circle" } }), false);
  assert.equal(validate({ connections: [{ endpoints: ["one"] }] }), false);
});