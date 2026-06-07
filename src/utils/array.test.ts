import { describe, it, expect } from "vitest";
import { shuffle } from "./array";

describe("shuffle", () => {
  it("возвращает массив той же длины", () => {
    expect(shuffle([1, 2, 3, 4, 5])).toHaveLength(5);
  });

  it("содержит те же элементы, что и исходный массив", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr).sort()).toEqual([...arr].sort());
  });

  it("не мутирует исходный массив", () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });

  it("корректно обрабатывает пустой массив", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("корректно обрабатывает массив из одного элемента", () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it("работает с массивом строк", () => {
    const arr = ["а", "б", "в", "г"];
    const result = shuffle(arr);
    expect(result.sort()).toEqual([...arr].sort());
  });
});
