import { parseQueryTag } from "../parseQueryTag";
import { it, expect } from '../../testing'

function checkTag(actual, desired) {
    expect(actual.attr).toEqual(desired.attr);
    expect(actual.value).toEqual(desired.value);
    expect(actual.isParameter || false).toEqual(desired.isParameter || false);
}

it("parses a tag with just an attr", () => {
    checkTag(parseQueryTag("theattr"), {
        attr: "theattr",
        value: undefined,
    });
});

it("parses attr=value", () => {
  checkTag(parseQueryTag("theattr=123"), {
    attr: "theattr",
    value: "123"
  });
});

it("parses allowed characters in attr", () => {
  checkTag(parseQueryTag("the/attr.123=123"), {
    attr: "the/attr.123",
    value: "123"
  });
});

it(`parses attr="value"`, () => {
  checkTag(parseQueryTag('theattr="123"'), {
    attr: "theattr",
    value: "123"
  });
});

it(`parses $attr"`, () => {
  checkTag(parseQueryTag('$theattr'), {
    attr: "theattr",
    value: undefined,
    isParameter: true,
  });
});

/*
it("parses attr=(tuple)", () => {
  expect(parseQueryTag("theattr=(a b c)")).toMatchInlineSnapshot(`
    Object {
      "attr": "theattr",
      "t": "tag",
      "value": Query {
        "isTransform": false,
        "steps": Array [
          QueryTuple {
            "byAttr": Map {
              "a" => 0,
              "b" => 1,
              "c" => 2,
            },
            "t": "queryTuple",
            "tags": Array [
              Object {
                "attr": "a",
                "t": "tag",
                "value": Object {
                  "t": "no_value",
                },
              },
              Object {
                "attr": "b",
                "t": "tag",
                "value": Object {
                  "t": "no_value",
                },
              },
              Object {
                "attr": "c",
                "t": "tag",
                "value": Object {
                  "t": "no_value",
                },
              },
            ],
          },
        ],
        "t": "query",
      },
    }
  `);
});

it("parses flag: --flag", () => {
  expect(parseQueryTag("--flag")).toMatchInlineSnapshot(`
    Object {
      "attr": "flag",
      "isFlag": true,
      "t": "tag",
      "value": Object {
        "t": "no_value",
      },
    }
  `);
});

it("parses flag: '--flag = value' as a flag with value", () => {
  expect(parseQueryTag("--flag=value")).toMatchInlineSnapshot(`
    Object {
      "attr": "flag",
      "isFlag": true,
      "t": "tag",
      "value": Object {
        "str": "value",
        "t": "str_value",
      },
    }
  `);
});

it("parses flag: '--flag --flag' as two flags", () => {
  expect(parseQueryTag("--flag --flag")).toMatchInlineSnapshot(`
    Object {
      "attr": "flag",
      "isFlag": true,
      "t": "tag",
      "value": Object {
        "t": "no_value",
      },
    }
  `);
});

it("parses attr(tuple)", () => {
  expect(parseQueryTag("attr(tuple)")).toMatchInlineSnapshot(`
    Object {
      "attr": "attr",
      "t": "tag",
      "value": Query {
        "isTransform": false,
        "steps": Array [
          QueryTuple {
            "byAttr": Map {
              "tuple" => 0,
            },
            "t": "queryTuple",
            "tags": Array [
              Object {
                "attr": "tuple",
                "t": "tag",
                "value": Object {
                  "t": "no_value",
                },
              },
            ],
          },
        ],
        "t": "query",
      },
    }
  `);
});

it("parses ? for optional", () => {
  expect(parseQueryTag("x?")).toMatchInlineSnapshot(`
    Object {
      "attr": "x",
      "isOptional": true,
      "t": "tag",
      "value": Object {
        "t": "no_value",
      },
    }
  `);
  expect(parseQueryTag("x?=val")).toMatchInlineSnapshot(`
    Object {
      "attr": "x",
      "isOptional": true,
      "t": "tag",
      "value": Object {
        "str": "val",
        "t": "str_value",
      },
    }
  `);
});
*/
