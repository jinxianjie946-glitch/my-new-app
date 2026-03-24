const mockDb = {
  prepare: jest.fn(),
  transaction: jest.fn()
};

jest.mock("../src/db", () => ({
  connect: jest.fn(() => mockDb)
}));

const repo = require("../src/repositories/verticalsRepository");

describe("verticalsRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getAll returns parsed payload rows", () => {
    mockDb.prepare.mockReturnValueOnce({
      all: () => [{ id: "smartphones", payload: "{\"home\":{\"marketSize\":\"$1\"}}" }]
    });

    const result = repo.getAll();
    expect(result).toEqual([{ id: "smartphones", payload: { home: { marketSize: "$1" } } }]);
  });

  it("getById returns null when row not found", () => {
    mockDb.prepare.mockReturnValueOnce({
      get: () => undefined
    });

    const result = repo.getById("none");
    expect(result).toBeNull();
  });

  it("getById returns parsed row when found", () => {
    mockDb.prepare.mockReturnValueOnce({
      get: () => ({ id: "smartphones", payload: "{\"home\":{\"marketSize\":\"$1\"}}" })
    });

    const result = repo.getById("smartphones");
    expect(result).toEqual({ id: "smartphones", payload: { home: { marketSize: "$1" } } });
  });

  it("updateHomePartial returns null when row missing", () => {
    const selectStmt = { get: () => undefined };
    const updateStmt = { run: jest.fn() };
    mockDb.prepare
      .mockReturnValueOnce(selectStmt)
      .mockReturnValueOnce(updateStmt);
    mockDb.transaction.mockImplementation(fn => (...args) => fn(...args));

    const result = repo.updateHomePartial("none", { marketSize: "$2" });
    expect(result).toBeNull();
    expect(updateStmt.run).not.toHaveBeenCalled();
  });

  it("updateHomePartial updates payload when row exists", () => {
    const selectStmt = { get: () => ({ id: "smartphones", payload: "{\"home\":{\"asp\":\"$200\"}}" }) };
    const updateStmt = { run: jest.fn() };
    mockDb.prepare
      .mockReturnValueOnce(selectStmt)
      .mockReturnValueOnce(updateStmt);
    mockDb.transaction.mockImplementation(fn => (...args) => fn(...args));

    const result = repo.updateHomePartial("smartphones", { marketSize: "$700B" });
    expect(updateStmt.run).toHaveBeenCalled();
    expect(result).toEqual({
      id: "smartphones",
      payload: {
        home: {
          asp: "$200",
          marketSize: "$700B"
        }
      }
    });
  });
});
