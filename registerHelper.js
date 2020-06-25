/**
Resume:
  - Transforms a unix timestamp value into a date of the type DD / MM / YYYY HH: MM: SS
Parameters:
   - date: On unix timestamp
   - type: It can be second ('s') or milliseconds ('ms')
Use:
  - In the FlowBroker template node
  - Using HandleBars
  - Example:
     {{#date_parse_unix_timestamp 1593096616 's'}}{{/date_parse_unix_timestamp}} => Response = 19/01/1970, 07:31:36
 */
/**
 * {{#date_parse_unix_timestamp payload.metadata.timestamp 's'}}{{/date_parse_unix_timestamp}}
 */
handlebars.registerHelper("date_parse_unix_timestamp", function (date, type) {
  if (arguments.length <= 2) {
    type = "s";
  }
  let newDate = "";
  if (type == "s") {
    newDate = new Date(date);
  }
  if (type == "ms") {
    newDate = new Date(date * 1000);
  }

  newDate = newDate.toLocaleString("pt-PT", { hour12: false });
  return newDate;
});

/**
Resume:
  - Generates unique ids according to the size passed
Parameters:
   - size: Generated id size. Optional, as the default is 10
Use:
  - In the FlowBroker template node
  - Using HandleBars
  - Example:
     {{#get_id_unique }}{{/get_id_unique}} => Response = 4393238236-4
 */
handlebars.registerHelper("id_generator", function (size) {
  if (arguments.length <= 1) {
    size = 10;
  }
  var randomized = Math.ceil(Math.random() * Math.pow(10, size));
  var digit = Math.ceil(Math.log(randomized));
  while (digit > size) {
    digit = Math.ceil(Math.log(digit));
  }
  var id_unique = randomized + "-" + digit;
  return id_unique;
});

/**
Resume:
  - Performs mathematical operations
Parameters:
   - lvalue and rvalue: These are numbers that will be used to perform the operation
   - operator: It is a string, which is the operator. Can be. '*', '+', '-', '/', '%'
Use:
  - In the FlowBroker template node
  - Using HandleBars
  - Example:
    {{#math 11 '-' 10}}{{/math}} => Response = 1
    {{#math 11 '+' 10}}{{/math}} or {{#math 11 10}}{{/math}} => Response = 21
     ...
 */
handlebars.registerHelper("math", function (lvalue, operator, rvalue, options) {
  if (arguments.length < 4) {
    options = rvalue;
    rvalue = operator;
    operator = "+";
  }

  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);

  return {
    "+": lvalue + rvalue,
    "-": lvalue - rvalue,
    "*": lvalue * rvalue,
    "/": lvalue / rvalue,
    "%": lvalue % rvalue,
  }[operator];
});

/**
Resume:
  - Compare if the first value is equal to the second
Parameters:
   - first: A number
   - second: A number
Use:
  - In the FlowBroker template node
  - Using HandleBars
  - Example:
    {{#eq 10 10}}
          When it is true
      {{else}}
          When it is false
    {{/eq}}
 */
handlebars.registerHelper("eq", function (a, b, opts) {
  if (a == b) return opts.fn(this);
  else return opts.inverse(this);
});

/**
Resume:
  - Compare whether the first value is less than or equal to the second
Parameters:
   - first: A number
   - second: A number
Use:
  - In the FlowBroker template node
  - Using HandleBars
  - Example:
    {{#lte 10 11}}
          When it is true
      {{else}}
          When it is false
    {{/lte}}
 */
handlebars.registerHelper("lte", function (a, b, opts) {
  if (a <= b) return opts.fn(this);
  else return opts.inverse(this);
});

/**
Resume:
  - Compare whether the first value is greater than or equal to the second
Parameters:
   - first: A number
   - second: A number
Use:
  - In the FlowBroker template node
  - Using HandleBars
  - Example:
    {{#gte 11 10}}
          When it is true
      {{else}}
          When it is false
    {{/gte}}
 */
handlebars.registerHelper("gte", function (first, second, opts) {
  if (first >= second) return opts.fn(this);
  else return opts.inverse(this);
});

/**
 Resume:
  - Returns the age, in days, months and years from a date of birth
Parameters:
   - Date: The date of birth, can be in the form DD/MM/ YYYY or YYYYMMDD or "YYYY-MM-DD HH:MM:SS"
   {{#age payload.data.attrs.dateBirth}}{{/age}}
Use:
  - In the FlowBroker template node
  - Using HandleBars
  - Example:
    {{#age '13/04/2000'}}{{/age}} => Response: '{"years":20,"months":2,"days":12}'
 */
handlebars.registerHelper("age", function (date) {
  let day, month, year;
  if (date.indexOf("/") != -1) {
    [day, month, year] = date.split("/");
  } else if (date.indexOf("-") != -1) {
    [year, month, day] = date.split(" ")[0].split("-");
  } else {
    year = date.substring(0, 4);
    month = date.substring(4, 6);
    day = date.substring(6, 8);
  }
  const birthDate = new Date(year, month - 1, day);
  const now = new Date();

  function DaysInMonth(Y, M) {
    const date = new Date(Y, M, 1, 12);
    date.setDate(0);
    return date.getDate();
  }

  function datediff(date1, date2) {
    var y1 = date1.getFullYear(),
      m1 = date1.getMonth(),
      d1 = date1.getDate(),
      y2 = date2.getFullYear(),
      m2 = date2.getMonth(),
      d2 = date2.getDate();

    if (d1 < d2) {
      m1--;
      d1 += DaysInMonth(y2, m2);
    }
    if (m1 < m2) {
      y1--;
      m1 += 12;
    }

    return { years: y1 - y2, months: m1 - m2, days: d1 - d2 };
  }

  const result = datediff(now, birthDate);
  return JSON.stringify(result);
});

/**
 * -------------------------NOT YET-----------------------------
 */

/**
Parameters:
   - income: These are the data that will be analyzed (payload.data.attrs)
   - thresholds: An object that contains the data to be compared. It must be of the form "attributeName_max" or/and "attributeName_min". In addition, it is mandatory to contain a parameter called "limit" and another called "filtered". These, respectively, deal with the number of parameters that can exceed the limit and the value that must be filtered from the data, the default is -100
 */
handlebars.registerHelper("protocol_thresholds", function (
  income,
  thresholds,
  opts
) {
  let limit = thresholds["limit"];
  const ignore = thresholds["ignore"] ? thresholds["ignore"] : -100;
  delete thresholds.limit;
  delete thresholds.filtered;

  /*
   * Take all parameters that have threshold, that is, it has "_max" or "_min"
   */
  let params_with_thresholds = Object.keys(thresholds).map((key) => {
    let param = key.split("_max")[0];
    param = param.split("_min")[0];
    return param;
  });

  /*
   * Filtra os repetidos
   */
  params_with_thresholds = params_with_thresholds.filter(
    (este, i) => params_with_thresholds.indexOf(este) === i
  );

  /*
   * For each parameter with threshold it is compared with the incoming value and with the filtrate
   */
  for (var param of params_with_thresholds) {
    if (thresholds[param + "_max"]) {
      if (
        income[param] > thresholds[param + "_max"] &&
        income[param] != ignore
      ) {
        limit = limit - 1;
        continue;
      }
    }
    if (thresholds[param + "_min"]) {
      if (
        income[param] < thresholds[param + "_min"] &&
        income[param] != ignore
      ) {
        limit = limit - 1;
        continue;
      }
    }
  }

  if (limit <= 0) {
    return opts.fn(this);
  } else return opts.inverse(this);
});

/**
 * Used in FlowBroker Process Thresholds to verify that each attribute sent by the device is *being monitored.If so, check
 * if the value is within the thresholds.
 * Function returns a json containing alerts
 * if any data is being monitored and
 * if it is not it sends a json with a false status attribute
 */

handlebars.registerHelper("status_alert", function (attributes, opts) {
  var response = {
    alerts: [],
  };
  let checked = false;
  Object.keys(attributes).map(function (attribute) {
    let origin_attribute = "";
    if (JSON.stringify(attribute).indexOf("_min") > -1) {
      origin_attribute = attribute.replace("_min", "");
      if (attributes[origin_attribute] != null) {
        checked = true;
        if (
          attributes[origin_attribute] <= attributes[origin_attribute + "_min"]
        ) {
          response["alerts"].push({
            attr: origin_attribute,
            message: "Less than or equal to minimum",
            current_value: attributes[origin_attribute],
            status: "Low",
            threshold: {
              min: attributes[origin_attribute + "_min"],
              max: attributes[origin_attribute + "_max"],
            },
          });
        } else if (
          attributes[origin_attribute] >= attributes[origin_attribute + "_max"]
        ) {
          response["alerts"].push({
            attr: origin_attribute,
            message: "Greater than or equal to maximum",
            current_value: attributes[origin_attribute],
            status: "High",
            threshold: {
              min: attributes[origin_attribute + "_min"],
              max: attributes[origin_attribute + "_max"],
            },
          });
        } else {
          response["alerts"].push({
            attr: origin_attribute,
            message: "It's normal",
            current_value: attributes[origin_attribute],
            status: "Normal",
            threshold: {
              min: attributes[origin_attribute + "_min"],
              max: attributes[origin_attribute + "_max"],
            },
          });
        }
      }
    }
  });

  if (checked) {
    return JSON.stringify(response);
  } else {
    return JSON.stringify({
      status: false,
    });
  }
});

//TODO: Melhorar nome e descrição e objetivo dessa função  era o formated_linestring
handlebars.registerHelper("concatenate_geojson", function (
  geo_loc_a,
  geo_loc_b
) {
  let response = { type: "LineString", coordinates: [], properties: {} };

  if (arguments.length <= 1) {
    return '{"error" :"Enter two arguments (Two Points or One Point and One LineString)"}';
  }
  if (
    !geo_loc_a.type ||
    !geo_loc_b.type ||
    !geo_loc_a.coordinates ||
    !geo_loc_b.coordinates ||
    !geo_loc_a.properties ||
    !geo_loc_b.properties
  ) {
    return '{"error":"Must be GeoJson"}';
  }

  const properties_a = Object.keys(geo_loc_a.properties);
  const properties_b = Object.keys(geo_loc_b.properties);
  let [first, next] =
    properties_a.length > properties_b.length
      ? [properties_b, geo_loc_a.properties]
      : [properties_a, geo_loc_b.properties];

  let intersect_properties_a_b = first.filter((property) => property in next);
  let properties_only_a = properties_a.filter(
    (property) => !geo_loc_b.properties[property]
  );
  let properties_only_b = properties_b.filter(
    (property) => !geo_loc_a.properties[property]
  );

  intersect_properties_a_b.forEach((property) => {
    if (geo_loc_a.type == "LineString") {
      response.properties[property] = geo_loc_a.properties[property];
      response.properties[property].push(geo_loc_b.properties[property]);
    } else if (geo_loc_b.type == "LineString") {
      response.properties[property] = geo_loc_b.properties[property];
      response.properties[property].push(geo_loc_a.properties[property]);
    } else {
      response.properties[property] = [];
      response.properties[property].push(geo_loc_a.properties[property]);
      response.properties[property].push(geo_loc_b.properties[property]);
    }
  });
  properties_only_a.forEach((property) => {
    response.properties[property] = geo_loc_a.properties[property];
  });
  properties_only_b.forEach((property) => {
    response.properties[property] = geo_loc_b.properties[property];
  });

  if (
    (geo_loc_a.type == "Point" && geo_loc_b.type == "Point") ||
    (geo_loc_b.type == "Point" && geo_loc_a.type == "Point")
  ) {
    response.coordinates.push(geo_loc_a.coordinates);
    response.coordinates.push(geo_loc_b.coordinates);
  }

  if (geo_loc_a.type == "Point" && geo_loc_b.type == "LineString") {
    geo_loc_b.coordinates.push(geo_loc_a.coordinates);
    response.coordinates = geo_loc_b.coordinates;
  }

  if (geo_loc_a.type == "LineString" && geo_loc_b.type == "Point") {
    geo_loc_a.coordinates.push(geo_loc_b.coordinates);
    response.coordinates = geo_loc_a.coordinates;
  }
  response.properties["length"] = response.coordinates.length;
  return JSON.stringify(response);
});

//TODO: Melhora os tipos de datas que podem ser inseridas
handlebars.registerHelper("age", function (date) {
  let day, month, year;
  if (date.indexOf("/") != -1) {
    [day, month, year] = date.split("/");
  } else {
    year = date.substring(0, 4);
    month = date.substring(4, 6);
    day = date.substring(6, 8);
  }
  const birthDate = new Date(year, month - 1, day);
  const now = new Date();

  function DaysInMonth(Y, M) {
    const date = new Date(Y, M, 1, 12);
    date.setDate(0);
    return date.getDate();
  }

  function datediff(date1, date2) {
    var y1 = date1.getFullYear(),
      m1 = date1.getMonth(),
      d1 = date1.getDate(),
      y2 = date2.getFullYear(),
      m2 = date2.getMonth(),
      d2 = date2.getDate();

    if (d1 < d2) {
      m1--;
      d1 += DaysInMonth(y2, m2);
    }
    if (m1 < m2) {
      y1--;
      m1 += 12;
    }

    return { years: y1 - y2, months: m1 - m2, days: d1 - d2 };
  }

  const result = datediff(now, birthDate);
  return JSON.stringify(result);
});

//TODO: Colocar uma descrição legal
handlebars.registerHelper("process_thresholds", function (
  income,
  thresholds,
  opts
) {
  let limit = thresholds["limit"];
  const ignore = thresholds["ignore"] ? thresholds["ignore"] : -100;
  delete thresholds.limit;
  delete thresholds.filtered;

  /*
   * Take all parameters that have threshold, that is, it has "_max" or "_min"
   */
  let params_with_thresholds = Object.keys(thresholds).map((key) => {
    let param = key.split("_max")[0];
    param = param.split("_min")[0];
    return param;
  });

  /*
   * Filters the duplicates
   */
  params_with_thresholds = params_with_thresholds.filter(
    (este, i) => params_with_thresholds.indexOf(este) === i
  );

  /*
   * For each parameter with threshold it is compared with the incoming value and with the filtrate
   */
  for (var param of params_with_thresholds) {
    if (thresholds[param + "_max"]) {
      if (
        income[param] > thresholds[param + "_max"] &&
        income[param] != ignore
      ) {
        limit = limit - 1;
        continue;
      }
    }
    if (thresholds[param + "_min"]) {
      if (
        income[param] < thresholds[param + "_min"] &&
        income[param] != ignore
      ) {
        limit = limit - 1;
        continue;
      }
    }
  }

  if (limit <= 0) {
    return opts.fn(this);
  } else return opts.inverse(this);
});

handlebars.registerHelper("filter", function (data, filtered) {
  let result = {};
  for (param in data) {
    if (data[param] != filtered) {
      result[param] = data[param];
    }
  }
  return JSON.stringify(result);
});

handlebars.registerHelper("ct", function (a, b, opts) {
  if (a.indexOf(b) > -1) return opts.fn(this);
  else return opts.inverse(this);
});

handlebars.registerHelper("replace", function (a, b, c, opts) {
  return opts.fn(a.replace(b, c));
});

/**
 Used in FlowBroker Recreate Device Patient to recreate the device with the same sector values(floor) and name
 */
handlebars.registerHelper("set_attributes_recreation", function (
  attrs,
  return_attrs,
  opts
) {
  let response = [];

  for (let attr in attrs) {
    for (let object of attrs[attr])
      if (return_attrs.indexOf(object.label) != -1)
        response.push({
          id: object.id,
          label: object.label,
          static_value: object.static_value,
          template_id: object.template_id,
        });
  }
  return JSON.stringify(response);
});
