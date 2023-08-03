import { faker } from "@faker-js/faker";
import justCamelCase from "just-camel-case";

const fakerMap = {
  // Name:
  firstName: {
    func: faker.name.firstName,
    keywords: ["firstName", "clientName", "customerName", "name"],
  },
  fullName: { func: faker.name.fullName, keywords: ["fullName"] },
  gender: { func: faker.name.gender, keywords: ["gender", "sex"] },
  job: { func: faker.name.jobTitle, keywords: ["job"] },
  jobArea: { func: faker.name.jobArea, keywords: ["jobArea"] },
  jobDescriptor: {
    func: faker.name.jobDescriptor,
    keywords: ["jobDescriptor"],
  },
  jobTitle: { func: faker.name.jobTitle, keywords: ["jobTitle"] },
  jobType: { func: faker.name.jobType, keywords: ["jobType"] },
  lastName: { func: faker.name.lastName, keywords: ["lastName"] },
  middleName: { func: faker.name.middleName, keywords: ["middleName"] },
  sexType: { func: faker.name.sexType, keywords: ["sexType"] },
  // Address:
  buildingNumber: {
    func: faker.address.buildingNumber,
    keywords: ["buildingNumber"],
  },
  cardinalDirection: {
    func: faker.address.cardinalDirection,
    keywords: ["cardinalDirection"],
  },
  city: { func: faker.address.city, keywords: ["city"] },
  cityName: { func: faker.address.cityName, keywords: ["cityName"] },
  country: { func: faker.address.country, keywords: ["country"] },
  countryCode: { func: faker.address.countryCode, keywords: ["countryCode"] },
  county: { func: faker.address.county, keywords: ["county"] },
  direction: { func: faker.address.direction, keywords: ["direction"] },
  latitude: { func: faker.address.latitude, keywords: ["latitude"] },
  longitude: { func: faker.address.longitude, keywords: ["longitude"] },
  nearbyGPSCoordinate: {
    func: faker.address.nearbyGPSCoordinate,
    keywords: ["coordinate"],
  },
  ordinalDirection: {
    func: faker.address.ordinalDirection,
    keywords: ["ordinalDirection"],
  },
  secondaryAddress: {
    func: faker.address.secondaryAddress,
    keywords: ["secondaryAddress"],
  },
  state: { func: faker.address.state, keywords: ["state"] },
  stateAbbr: { func: faker.address.stateAbbr, keywords: ["stateAbbr"] },
  street: { func: faker.address.street, keywords: ["street"] },
  streetAddress: {
    func: faker.address.streetAddress,
    keywords: ["streetAddress"],
  },
  streetName: { func: faker.address.streetName, keywords: ["streetName"] },
  streetPrefix: {
    func: faker.address.streetPrefix,
    keywords: ["streetPrefix"],
  },
  streetSuffix: {
    func: faker.address.streetSuffix,
    keywords: ["streetSuffix"],
  },
  timeZone: { func: faker.address.timeZone, keywords: ["timeZone"] },
  zipCode: { func: faker.address.zipCode, keywords: ["zipCode"] },
  zipCodeByState: {
    func: faker.address.zipCodeByState,
    keywords: ["zipCodeByState"],
  },
  // Commerce:
  color: { func: faker.commerce.color, keywords: ["color"] },
  department: { func: faker.commerce.department, keywords: ["department"] },
  price: { func: faker.commerce.price, keywords: ["price"] },
  product: { func: faker.commerce.product, keywords: ["product"] },
  productAdjective: {
    func: faker.commerce.productAdjective,
    keywords: ["productAdjective"],
  },
  productDescription: {
    func: faker.commerce.productDescription,
    keywords: ["productDescription"],
  },
  productMaterial: {
    func: faker.commerce.productMaterial,
    keywords: ["productMaterial"],
  },
  productName: {
    func: faker.commerce.productName,
    keywords: ["productName"],
  },
  // Finance:
  account: { func: faker.finance.account, keywords: ["account"] },
  accountName: { func: faker.finance.accountName, keywords: ["accountName"] },
  amount: { func: faker.finance.amount, keywords: ["amount"] },
  bic: { func: faker.finance.bic, keywords: ["bic"] },
  bitcoinAddress: {
    func: faker.finance.bitcoinAddress,
    keywords: ["bitcoinAddress"],
  },
  creditCardCVV: {
    func: faker.finance.creditCardCVV,
    keywords: ["creditCardCVV"],
  },
  creditCardIssuer: {
    func: faker.finance.creditCardIssuer,
    keywords: ["creditCardIssuer"],
  },
  creditCardNumber: {
    func: faker.finance.creditCardNumber,
    keywords: ["creditCardNumber"],
  },
  currencyCode: {
    func: faker.finance.currencyCode,
    keywords: ["currencyCode"],
  },
  currencyName: {
    func: faker.finance.currencyName,
    keywords: ["currencyName"],
  },
  currencySymbol: {
    func: faker.finance.currencySymbol,
    keywords: ["currencySymbol"],
  },
  ethereumAddress: {
    func: faker.finance.ethereumAddress,
    keywords: ["ethereumAddress"],
  },
  iban: { func: faker.finance.iban, keywords: ["iban"] },
  litecoinAddress: {
    func: faker.finance.litecoinAddress,
    keywords: ["litecoinAddress"],
  },
  mask: { func: faker.finance.mask, keywords: ["mask"] },
  pin: { func: faker.finance.pin, keywords: ["pin"] },
  routingNumber: {
    func: faker.finance.routingNumber,
    keywords: ["routingNumber"],
  },
  transactionDescription: {
    func: faker.finance.transactionDescription,
    keywords: ["transactionDescription", "transactionType", "transaction"],
  },
  transactionType: {
    func: faker.finance.transactionType,
    keywords: ["transactionType"],
  },
  // Date:
  birthdate: { func: faker.date.birthdate, keywords: ["birthDate"] },
  month: { func: faker.date.month, keywords: ["month"] },
  weekday: { func: faker.date.weekday, keywords: ["weekday", "day"] },
  // Phone:
  imei: { func: faker.phone.imei, keywords: ["imei"] },
  number: {
    func: faker.phone.number,
    keywords: [
      "number",
      "phoneNumber",
      "mobileNumber",
      "phone",
      "mobile",
      "tel",
      "telephone",
      "cell",
      "cellphone",
      "cellular",
      "cellularPhone",
      "cellularTelephone",
      "cellularNumber",
      "cellularPhoneNumber",
    ],
  },
  // Company:
  companySuffix: {
    func: faker.company.companySuffix,
    keywords: ["companySuffix"],
  },
  companyName: {
    func: faker.company.name,
    keywords: ["companyName", "company"],
  },
  // Internet:
  avatar: { func: faker.internet.avatar, keywords: ["avatar"] },
  domainName: { func: faker.internet.domainName, keywords: ["domainName"] },
  domainSuffix: {
    func: faker.internet.domainSuffix,
    keywords: ["domainSuffix"],
  },
  domainWord: { func: faker.internet.domainWord, keywords: ["domainWord"] },
  email: { func: faker.internet.email, keywords: ["email"] },
  emoji: { func: faker.internet.emoji, keywords: ["emoji"] },
  exampleEmail: {
    func: faker.internet.exampleEmail,
    keywords: ["exampleEmail"],
  },
  httpMethod: { func: faker.internet.httpMethod, keywords: ["httpMethod"] },
  httpStatusCode: {
    func: faker.internet.httpStatusCode,
    keywords: ["httpStatusCode", "statusCode", "httpStatus", "httpCode"],
  },
  ip: { func: faker.internet.ip, keywords: ["ip", "ipAddress"] },
  ipv4: { func: faker.internet.ipv4, keywords: ["ipv4"] },
  ipv6: { func: faker.internet.ipv6, keywords: ["ipv6"] },
  password: { func: faker.internet.password, keywords: ["password"] },
  port: { func: faker.internet.port, keywords: ["port"] },
  url: { func: faker.internet.url, keywords: ["url"] },
  userAgent: { func: faker.internet.userAgent, keywords: ["userAgent"] },
  userName: {
    func: faker.internet.userName,
    keywords: ["username", "userName"],
  },
};

function injectMocks(template) {
  let result = template;
  // todo: get the mocks from mocks.js
  const userMocks = {};

  // find all the variables in the template
  // todo: get "{{}}" from config
  let variables = result.match(/{{\s*[\w.]+\s*}}/g);
  // unique them:
  variables = [...new Set(variables)];

  // replace them with the mock data
  variables?.forEach((variable) => {
    const variableName = variable.replace(/{{\s*|\s*}}/g, "");
    const camelCaseVariableName = justCamelCase(variableName);
    console.log("🤖 :: camelCaseVariableName:", camelCaseVariableName);

    if (userMocks[camelCaseVariableName]) {
      result = result.replace(variable, userMocks[camelCaseVariableName]);
      return;
    }

    Object.values(fakerMap).forEach((mock) => {
      if (mock.keywords.includes(camelCaseVariableName)) {
        const mockValue = mock.func();
        result = result.replaceAll(variable, mockValue);
        return;
      }
    });
  });

  return result;
}

export default injectMocks;
