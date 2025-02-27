// Test ported from Golang
// https://github.com/golang/go/blob/2cc15b1/src/encoding/csv/reader_test.go
// Copyright 2011 The Go Authors. All rights reserved. BSD license.
// https://github.com/golang/go/blob/master/LICENSE
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { assertEquals, assertThrows } from "../testing/asserts.ts";
import { parse, ParseError } from "./csv.ts";

Deno.test({
  name: "Simple",
  fn() {
    const input = "a,b,c\n";
    assertEquals(
      parse(input),
      [["a", "b", "c"]],
    );
  },
});
Deno.test({
  name: "CRLF",
  fn() {
    const input = "a,b\r\nc,d\r\n";
    assertEquals(
      parse(input),
      [
        ["a", "b"],
        ["c", "d"],
      ],
    );
  },
});

Deno.test({
  name: "BareCR",
  fn() {
    const input = "a,b\rc,d\r\n";
    assertEquals(
      parse(input),
      [["a", "b\rc", "d"]],
    );
  },
});

Deno.test({
  name: "RFC4180test",
  fn() {
    const input =
      '#field1,field2,field3\n"aaa","bbb","ccc"\n"a,a","bbb","ccc"\nzzz,yyy,xxx';
    assertEquals(
      parse(input),
      [
        ["#field1", "field2", "field3"],
        ["aaa", "bbb", "ccc"],
        ["a,a", `bbb`, "ccc"],
        ["zzz", "yyy", "xxx"],
      ],
    );
  },
});
Deno.test({
  name: "NoEOLTest",
  fn() {
    const input = "a,b,c";
    assertEquals(
      parse(input),
      [["a", "b", "c"]],
    );
  },
});

Deno.test({
  name: "Semicolon",
  fn() {
    const input = "a;b;c\n";
    assertEquals(
      parse(input, { separator: ";" }),
      [["a", "b", "c"]],
    );
  },
});

Deno.test({
  name: "MultiLine",
  fn() {
    const input = '"two\nline","one line","three\nline\nfield"';
    assertEquals(
      parse(input),
      [["two\nline", "one line", "three\nline\nfield"]],
    );
  },
});

Deno.test({
  name: "BlankLine",
  fn() {
    const input = "a,b,c\n\nd,e,f\n\n";
    assertEquals(
      parse(input),
      [
        ["a", "b", "c"],
        ["d", "e", "f"],
      ],
    );
  },
});

Deno.test({
  name: "BlankLineFieldCount",
  fn() {
    const input = "a,b,c\n\nd,e,f\n\n";
    assertEquals(
      parse(input, { fieldsPerRecord: 0 }),
      [
        ["a", "b", "c"],
        ["d", "e", "f"],
      ],
    );
  },
});

Deno.test({
  name: "TrimSpace",
  fn() {
    const input = " a,  b,   c\n";
    assertEquals(
      parse(input, { trimLeadingSpace: true }),
      [["a", "b", "c"]],
    );
  },
});

Deno.test({
  name: "LeadingSpace",
  fn() {
    const input = " a,  b,   c\n";
    const output = [[" a", "  b", "   c"]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "Comment",
  fn() {
    const input = "#1,2,3\na,b,c\n#comment";
    const output = [["a", "b", "c"]];
    assertEquals(parse(input, { comment: "#" }), output);
  },
});
Deno.test({
  name: "NoComment",
  fn() {
    const input = "#1,2,3\na,b,c";
    const output = [
      ["#1", "2", "3"],
      ["a", "b", "c"],
    ];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "LazyQuotes",
  fn() {
    const input = `a "word","1"2",a","b`;
    const output = [[`a "word"`, `1"2`, `a"`, `b`]];
    assertEquals(parse(input, { lazyQuotes: true }), output);
  },
});
Deno.test({
  name: "BareQuotes",
  fn() {
    const input = `a "word","1"2",a"`;
    const output = [[`a "word"`, `1"2`, `a"`]];
    assertEquals(parse(input, { lazyQuotes: true }), output);
  },
});
Deno.test({
  name: "BareDoubleQuotes",
  fn() {
    const input = `a""b,c`;
    const output = [[`a""b`, `c`]];
    assertEquals(parse(input, { lazyQuotes: true }), output);
  },
});
Deno.test({
  name: "BadDoubleQuotes",
  fn() {
    const input = `a""b,c`;
    assertThrows(
      () => parse(input),
      ParseError,
      'parse error on line 1, column 1: bare " in non-quoted-field',
    );
  },
});
Deno.test({
  name: "TrimQuote",
  fn() {
    const input = ` "a"," b",c`;
    const output = [["a", " b", "c"]];
    assertEquals(parse(input, { trimLeadingSpace: true }), output);
  },
});
Deno.test({
  name: "BadBareQuote",
  fn() {
    const input = `a "word","b"`;
    assertThrows(
      () => parse(input),
      ParseError,
      'parse error on line 1, column 2: bare " in non-quoted-field',
    );
  },
});
Deno.test({
  name: "BadTrailingQuote",
  fn() {
    const input = `"a word",b"`;
    assertThrows(
      () => parse(input),
      ParseError,
      'parse error on line 1, column 10: bare " in non-quoted-field',
    );
  },
});
Deno.test({
  name: "ExtraneousQuote",
  fn() {
    const input = `"a "word","b"`;
    assertThrows(
      () => parse(input),
      ParseError,
      `parse error on line 1, column 3: extraneous or missing " in quoted-field`,
    );
  },
});
Deno.test({
  name: "BadFieldCount",
  fn() {
    const input = "a,b,c\nd,e";
    assertThrows(
      () => parse(input, { fieldsPerRecord: 0 }),
      ParseError,
      "record on line 2: wrong number of fields",
    );
  },
});
Deno.test({
  name: "BadFieldCount1",
  fn() {
    const input = `a,b,c`;
    assertThrows(
      () => parse(input, { fieldsPerRecord: 2 }),
      ParseError,
      "record on line 1: wrong number of fields",
    );
  },
});
Deno.test({
  name: "FieldCount",
  fn() {
    const input = "a,b,c\nd,e";
    const output = [
      ["a", "b", "c"],
      ["d", "e"],
    ];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "TrailingCommaEOF",
  fn() {
    const input = "a,b,c,";
    const output = [["a", "b", "c", ""]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "TrailingCommaEOL",
  fn() {
    const input = "a,b,c,\n";
    const output = [["a", "b", "c", ""]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "TrailingCommaSpaceEOF",
  fn() {
    const input = "a,b,c, ";
    const output = [["a", "b", "c", ""]];
    assertEquals(parse(input, { trimLeadingSpace: true }), output);
  },
});
Deno.test({
  name: "TrailingCommaSpaceEOL",
  fn() {
    const input = "a,b,c, \n";
    const output = [["a", "b", "c", ""]];
    assertEquals(parse(input, { trimLeadingSpace: true }), output);
  },
});
Deno.test({
  name: "TrailingCommaLine3",
  fn() {
    const input = "a,b,c\nd,e,f\ng,hi,";
    const output = [
      ["a", "b", "c"],
      ["d", "e", "f"],
      ["g", "hi", ""],
    ];
    assertEquals(parse(input, { trimLeadingSpace: true }), output);
  },
});
Deno.test({
  name: "NotTrailingComma3",
  fn() {
    const input = "a,b,c, \n";
    const output = [["a", "b", "c", " "]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "CommaFieldTest",
  fn() {
    const input =
      `x,y,z,w\nx,y,z,\nx,y,,\nx,,,\n,,,\n"x","y","z","w"\n"x","y","z",""\n"x","y","",""\n"x","","",""\n"","","",""\n`;
    const output = [
      ["x", "y", "z", "w"],
      ["x", "y", "z", ""],
      ["x", "y", "", ""],
      ["x", "", "", ""],
      ["", "", "", ""],
      ["x", "y", "z", "w"],
      ["x", "y", "z", ""],
      ["x", "y", "", ""],
      ["x", "", "", ""],
      ["", "", "", ""],
    ];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "TrailingCommaIneffective1",
  fn() {
    const input = "a,b,\nc,d,e";
    const output = [
      ["a", "b", ""],
      ["c", "d", "e"],
    ];
    assertEquals(parse(input, { trimLeadingSpace: true }), output);
  },
});
Deno.test({
  name: "ReadAllReuseRecord",
  fn() {
    const input = "a,b\nc,d";
    const output = [
      ["a", "b"],
      ["c", "d"],
    ];
    assertEquals(parse(input), output);
    // ReuseRecord: true,
  },
});
Deno.test({
  name: "StartLine1", // Issue 19019
  fn() {
    const input = 'a,"b\nc"d,e';
    assertThrows(
      () => parse(input, { fieldsPerRecord: 2 }),
      ParseError,
      'record on line 1; parse error on line 2, column 1: extraneous or missing " in quoted-field',
    );
  },
});
Deno.test({
  name: "StartLine2",
  fn() {
    const input = 'a,b\n"d\n\n,e';
    assertThrows(
      () => parse(input, { fieldsPerRecord: 2 }),
      ParseError,
      'record on line 2; parse error on line 5, column 0: extraneous or missing " in quoted-field',
    );
  },
});
Deno.test({
  name: "CRLFInQuotedField", // Issue 21201
  fn() {
    const input = 'A,"Hello\r\nHi",B\r\n';
    const output = [["A", "Hello\nHi", "B"]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "BinaryBlobField", // Issue 19410
  fn() {
    const input = "x09\x41\xb4\x1c,aktau";
    const output = [["x09A\xb4\x1c", "aktau"]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "TrailingCR",
  fn() {
    const input = "field1,field2\r";
    const output = [["field1", "field2"]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "QuotedTrailingCR",
  fn() {
    const input = '"field"\r';
    const output = [["field"]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "QuotedTrailingCRCR",
  fn() {
    const input = '"field"\r\r';
    assertThrows(
      () => parse(input, { fieldsPerRecord: 2 }),
      ParseError,
      'parse error on line 1, column 6: extraneous or missing " in quoted-field',
    );
  },
});
Deno.test({
  name: "FieldCR",
  fn() {
    const input = "field\rfield\r";
    const output = [["field\rfield"]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "FieldCRCR",
  fn() {
    const input = "field\r\rfield\r\r";
    const output = [["field\r\rfield\r"]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "FieldCRCRLF",
  fn() {
    const input = "field\r\r\nfield\r\r\n";
    const output = [["field\r"], ["field\r"]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "FieldCRCRLFCR",
  fn() {
    const input = "field\r\r\n\rfield\r\r\n\r";
    const output = [["field\r"], ["\rfield\r"]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "FieldCRCRLFCRCR",
  fn() {
    const input = "field\r\r\n\r\rfield\r\r\n\r\r";
    const output = [["field\r"], ["\r\rfield\r"], ["\r"]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "MultiFieldCRCRLFCRCR",
  fn() {
    const input = "field1,field2\r\r\n\r\rfield1,field2\r\r\n\r\r,";
    const output = [
      ["field1", "field2\r"],
      ["\r\rfield1", "field2\r"],
      ["\r\r", ""],
    ];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "NonASCIICommaAndComment",
  fn() {
    const input = "a£b,c£ \td,e\n€ comment\n";
    const output = [["a", "b,c", "d,e"]];
    assertEquals(
      parse(input, {
        trimLeadingSpace: true,
        separator: "£",
        comment: "€",
      }),
      output,
    );
  },
});
Deno.test({
  name: "NonASCIICommaAndCommentWithQuotes",
  fn() {
    const input = 'a€"  b,"€ c\nλ comment\n';
    const output = [["a", "  b,", " c"]];
    assertEquals(
      parse(input, { separator: "€", comment: "λ" }),
      output,
    );
  },
});
Deno.test(
  {
    // λ and θ start with the same byte.
    // This tests that the parser doesn't confuse such characters.
    name: "NonASCIICommaConfusion",
    fn() {
      const input = '"abθcd"λefθgh';
      const output = [["abθcd", "efθgh"]];
      assertEquals(
        parse(input, { separator: "λ", comment: "€" }),
        output,
      );
    },
  },
);
Deno.test({
  name: "NonASCIICommentConfusion",
  fn() {
    const input = "λ\nλ\nθ\nλ\n";
    const output = [["λ"], ["λ"], ["λ"]];
    assertEquals(parse(input, { comment: "θ" }), output);
  },
});
Deno.test({
  name: "QuotedFieldMultipleLF",
  fn() {
    const input = '"\n\n\n\n"';
    const output = [["\n\n\n\n"]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "MultipleCRLF",
  fn() {
    const input = "\r\n\r\n\r\n\r\n";
    const output: string[][] = [];
    assertEquals(parse(input), output);
  },
  /**
   * The implementation may read each line in several chunks if
   * it doesn't fit entirely.
   * in the read buffer, so we should test the code to handle that condition.
   */
} /* TODO(kt3k): Enable this test case)
 Deno.test({
    name: "HugeLines",
    fn() {
    const input = "#ignore\n".repeat(10000) + "@".repeat(5000) + ","
      "*".repeat(5000),
    const output = [["@".repeat(5000), "*".repeat(5000)]]
    assertEquals(parse(input), output)
    Comment: "#",
  },
  }*/);
Deno.test({
  name: "QuoteWithTrailingCRLF",
  fn() {
    const input = '"foo"bar"\r\n';
    assertThrows(
      () => parse(input),
      ParseError,
      `parse error on line 1, column 4: extraneous or missing " in quoted-field`,
    );
  },
});
Deno.test({
  name: "LazyQuoteWithTrailingCRLF",
  fn() {
    const input = '"foo"bar"\r\n';
    const output = [[`foo"bar`]];
    assertEquals(parse(input, { lazyQuotes: true }), output);
  },
});
Deno.test({
  name: "DoubleQuoteWithTrailingCRLF",
  fn() {
    const input = '"foo""bar"\r\n';
    const output = [[`foo"bar`]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "EvenQuotes",
  fn() {
    const input = `""""""""`;
    const output = [[`"""`]];
    assertEquals(parse(input), output);
  },
});
Deno.test({
  name: "OddQuotes",
  fn() {
    const input = `"""""""`;
    assertThrows(
      () => parse(input),
      ParseError,
      `parse error on line 1, column 7: extraneous or missing " in quoted-field`,
    );
  },
});
Deno.test({
  name: "LazyOddQuotes",
  fn() {
    const input = `"""""""`;
    const output = [[`"""`]];
    assertEquals(parse(input, { lazyQuotes: true }), output);
  },
});
Deno.test({
  name: "BadComma1",
  fn() {
    const input = "";
    assertThrows(
      () => parse(input, { separator: "\n" }),
      Error,
      "Invalid Delimiter",
    );
  },
});
Deno.test({
  name: "BadComma2",
  fn() {
    const input = "";
    assertThrows(
      () => parse(input, { separator: "\r" }),
      Error,
      "Invalid Delimiter",
    );
  },
});
Deno.test({
  name: "BadComma3",
  fn() {
    const input = "";
    assertThrows(
      () => parse(input, { separator: '"' }),
      Error,
      "Invalid Delimiter",
    );
  },
});
Deno.test({
  name: "BadComment1",
  fn() {
    const input = "";
    assertThrows(
      () => parse(input, { comment: "\n" }),
      Error,
      "Invalid Delimiter",
    );
  },
});
Deno.test({
  name: "BadComment2",
  fn() {
    const input = "";
    assertThrows(
      () => parse(input, { comment: "\r" }),
      Error,
      "Invalid Delimiter",
    );
  },
});
Deno.test({
  name: "BadCommaComment",
  fn() {
    const input = "";
    assertThrows(
      () => parse(input, { separator: "X", comment: "X" }),
      Error,
      "Invalid Delimiter",
    );
  },
});

Deno.test({
  name: "simple",
  fn() {
    const input = "a,b,c";
    const output = [["a", "b", "c"]];
    assertEquals(parse(input, { skipFirstRow: false }), output);
  },
});
Deno.test({
  name: "simple Bufreader",
  fn() {
    const input = "a,b,c";
    const output = [["a", "b", "c"]];
    assertEquals(parse(input, { skipFirstRow: false }), output);
  },
});
Deno.test({
  name: "multiline",
  fn() {
    const input = "a,b,c\ne,f,g\n";
    const output = [
      ["a", "b", "c"],
      ["e", "f", "g"],
    ];
    assertEquals(parse(input, { skipFirstRow: false }), output);
  },
});
Deno.test({
  name: "header mapping boolean",
  fn() {
    const input = "a,b,c\ne,f,g\n";
    const output = [{ a: "e", b: "f", c: "g" }];
    assertEquals(parse(input, { skipFirstRow: true }), output);
  },
});
Deno.test({
  name: "header mapping array",
  fn() {
    const input = "a,b,c\ne,f,g\n";
    const output = [
      { this: "a", is: "b", sparta: "c" },
      { this: "e", is: "f", sparta: "g" },
    ];
    assertEquals(
      parse(input, { columns: ["this", "is", "sparta"] }),
      output,
    );
  },
});
Deno.test({
  name: "header mapping object",
  fn() {
    const input = "a,b,c\ne,f,g\n";
    const output = [
      { this: "a", is: "b", sparta: "c" },
      { this: "e", is: "f", sparta: "g" },
    ];
    assertEquals(
      parse(input, {
        columns: [{ name: "this" }, { name: "is" }, { name: "sparta" }],
      }),
      output,
    );
  },
});
Deno.test({
  name: "provides both opts.skipFirstRow and opts.columns",
  fn() {
    const input = "a,b,1\nc,d,2\ne,f,3";
    const output = [
      { foo: "c", bar: "d", baz: "2" },
      { foo: "e", bar: "f", baz: "3" },
    ];
    assertEquals(
      parse(input, {
        skipFirstRow: true,
        columns: [{ name: "foo" }, { name: "bar" }, { name: "baz" }],
      }),
      output,
    );
  },
});
Deno.test({
  name: "mismatching number of headers and fields",
  fn() {
    const input = "a,b,c\nd,e";
    assertThrows(
      () =>
        parse(input, {
          skipFirstRow: true,
          columns: [{ name: "foo" }, { name: "bar" }, { name: "baz" }],
        }),
      Error,
      "Error number of fields line: 1\nNumber of fields found: 3\nExpected number of fields: 2",
    );
  },
});
