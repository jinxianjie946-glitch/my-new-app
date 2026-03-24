jest.mock("../src/repositories/verticalsRepository", () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  updateHomePartial: jest.fn()
}));

const repo = require("../src/repositories/verticalsRepository");
const service = require("../src/services/verticalsService");

describe("verticalsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("listVerticals maps repository rows", () => {
    repo.getAll.mockReturnValue([{ id: "smartphones" }, { id: "health" }]);
    const result = service.listVerticals();
    expect(result).toEqual([
      { id: "smartphones", name: "smartphones" },
      { id: "health", name: "health" }
    ]);
  });

  it("getVertical returns repository result", () => {
    repo.getById.mockReturnValue({ id: "smartphones", payload: {} });
    const result = service.getVertical("smartphones");
    expect(result).toEqual({ id: "smartphones", payload: {} });
  });

  it("getHome handles missing and existing vertical", () => {
    repo.getById.mockReturnValueOnce(null);
    expect(service.getHome("none")).toBeNull();

    repo.getById.mockReturnValueOnce({ id: "smartphones", payload: { home: { marketSize: "$1" } } });
    expect(service.getHome("smartphones")).toEqual({ marketSize: "$1" });

    repo.getById.mockReturnValueOnce({ id: "smartphones", payload: {} });
    expect(service.getHome("smartphones")).toBeNull();
  });

  it("getIndustry handles missing and existing vertical", () => {
    repo.getById.mockReturnValueOnce(null);
    expect(service.getIndustry("none")).toBeNull();

    repo.getById.mockReturnValueOnce({ id: "smartphones", payload: { industry: { shares: [1, 2] } } });
    expect(service.getIndustry("smartphones")).toEqual({ shares: [1, 2] });

    repo.getById.mockReturnValueOnce({ id: "smartphones", payload: {} });
    expect(service.getIndustry("smartphones")).toBeNull();
  });

  it("getConsumer handles missing and existing vertical", () => {
    repo.getById.mockReturnValueOnce(null);
    expect(service.getConsumer("none")).toBeNull();

    repo.getById.mockReturnValueOnce({ id: "smartphones", payload: { consumer: { users: "1" } } });
    expect(service.getConsumer("smartphones")).toEqual({ users: "1" });

    repo.getById.mockReturnValueOnce({ id: "smartphones", payload: {} });
    expect(service.getConsumer("smartphones")).toBeNull();
  });

  it("updateHome delegates to repository transaction update", () => {
    repo.updateHomePartial.mockReturnValue({ id: "smartphones", payload: { home: { marketSize: "$700B" } } });
    const result = service.updateHome("smartphones", { marketSize: "$700B" });
    expect(repo.updateHomePartial).toHaveBeenCalledWith("smartphones", { marketSize: "$700B" });
    expect(result).toEqual({ id: "smartphones", payload: { home: { marketSize: "$700B" } } });
  });
});
