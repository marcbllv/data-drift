import { Row } from "../../components/Table/Table";

export const patch =
  "@@ -2,9 +2,9 @@ unique_key,name,date,age\n 2022-12-Alice,Alice,2022-12,25\n 2023-01-Bob,Bob,2023-01,30\n 2023-01-Charlie,Charlie,2023-01,36\n+2023-01-Charline,Charline,2023-01,42\n 2023-02-Antoine,Antoine,2023-02,40\n-2023-02-Didier,Didier,2023-02,40\n+2023-02-Didier,Didier,2023-02,43\n 2023-02-Philipe,Philipe,2023-02,42\n-2023-03-Clement,Clement,2023-03,45\n 2023-03-Cyril,Cyril,2023-03,45\n 2023-03-Victor,Victor,2023-03,46";

export const expectedOldData: Row[] = [
  {
    isEmphasized: false,
    data: [
      { value: "2022-12-Alice" },
      { value: "Alice" },
      { value: "2022-12" },
      { value: "25" },
    ],
  },
  {
    isEmphasized: false,
    data: [
      { value: "2023-01-Bob" },
      { value: "Bob" },
      { value: "2023-01" },
      { value: "30" },
    ],
  },
  {
    isEmphasized: false,
    data: [
      { value: "2023-01-Charlie" },
      { value: "Charlie" },
      { value: "2023-01" },
      { value: "36" },
    ],
  },
  {
    isEmphasized: false,
    data: [{ value: "_" }, { value: "_" }, { value: "_" }, { value: "_" }],
  }, // empty line here
  {
    isEmphasized: false,
    data: [
      { value: "2023-02-Antoine" },
      { value: "Antoine" },
      { value: "2023-02" },
      { value: "40" },
    ],
  },
  {
    isEmphasized: true,
    data: [
      { value: "2023-02-Didier" },
      { value: "Didier" },
      { value: "2023-02" },
      { value: "40", isEmphasized: true },
    ],
  },
  {
    isEmphasized: false,
    data: [
      { value: "2023-02-Philipe" },
      { value: "Philipe" },
      { value: "2023-02" },
      { value: "42" },
    ],
  },
  {
    isEmphasized: true,
    data: [
      { value: "2023-03-Clement" },
      { value: "Clement" },
      { value: "2023-03" },
      { value: "45" },
    ],
  },
  {
    isEmphasized: false,
    data: [
      { value: "2023-03-Cyril" },
      { value: "Cyril" },
      { value: "2023-03" },
      { value: "45" },
    ],
  },
  {
    isEmphasized: false,
    data: [
      { value: "2023-03-Victor" },
      { value: "Victor" },
      { value: "2023-03" },
      { value: "46" },
    ],
  },
];

export const expectedNewData: Row[] = [
  {
    isEmphasized: false,
    data: [
      { value: "2022-12-Alice" },
      { value: "Alice" },
      { value: "2022-12" },
      { value: "25" },
    ],
  },
  {
    isEmphasized: false,
    data: [
      { value: "2023-01-Bob" },
      { value: "Bob" },
      { value: "2023-01" },
      { value: "30" },
    ],
  },
  {
    isEmphasized: false,
    data: [
      { value: "2023-01-Charlie" },
      { value: "Charlie" },
      { value: "2023-01" },
      { value: "36" },
    ],
  },
  {
    isEmphasized: true,
    data: [
      { value: "2023-01-Charline" },
      { value: "Charline" },
      { value: "2023-01" },
      { value: "42" },
    ],
  },
  {
    isEmphasized: false,
    data: [
      { value: "2023-02-Antoine" },
      { value: "Antoine" },
      { value: "2023-02" },
      { value: "40" },
    ],
  },
  {
    isEmphasized: true,
    data: [
      { value: "2023-02-Didier" },
      { value: "Didier" },
      { value: "2023-02" },
      { value: "43", isEmphasized: true },
    ],
  },
  {
    isEmphasized: false,
    data: [
      { value: "2023-02-Philipe" },
      { value: "Philipe" },
      { value: "2023-02" },
      { value: "42" },
    ],
  },
  {
    isEmphasized: false,
    data: [{ value: "_" }, { value: "_" }, { value: "_" }, { value: "_" }],
  }, // empty line here
  {
    isEmphasized: false,
    data: [
      { value: "2023-03-Cyril" },
      { value: "Cyril" },
      { value: "2023-03" },
      { value: "45" },
    ],
  },
  {
    isEmphasized: false,
    data: [
      { value: "2023-03-Victor" },
      { value: "Victor" },
      { value: "2023-03" },
      { value: "46" },
    ],
  },
];
