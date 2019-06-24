const index = require("./index");

test("extractOwnerRepo", () => {
  const cases = [
    ["github_pokutuna_FooBar", { owner: "pokutuna", repo: "FooBar" }],
    ["github_pokutuna_Foo_Bar", { owner: "pokutuna", repo: "Foo_Bar" }],
    ["bitbucket_pokutuna_FooBar", undefined]
  ];
  cases.forEach(c => expect(index.extractOwnerRepo(c[0])).toEqual(c[1]));
});
