import type { CompanyJson } from "./serialize";

//GET / api/ companies
export type GetCompaniesResponse = {
  companies: CompanyJson[];
};

//POST / api/ companies
export type PostCompanyRequestBody = {
  name: string;
};

export type PostCompanyResponse = {
  company: CompanyJson;
};
