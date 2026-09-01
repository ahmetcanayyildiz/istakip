export const DEMO_READ_ONLY_MESSAGE = "Demo hesabında değişiklik yapılamaz.";

export type DemoDatabaseError = {
  code?: string;
  message?: string;
};

export function isDemoReadOnlyError(error: DemoDatabaseError) {
  return error.code === "P0001" && error.message?.includes("demo_company_read_only") === true;
}
