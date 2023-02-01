import * as ccfapp from "@microsoft/ccf-app";

/**
 * Generate a swagger UI based on the OpenApi documents of (Application - Governance)
 * How to configure swagger UI: https://swagger.io/docs/open-source-tools/swagger-ui/usage/installation/
 */
export function getSwaggerUI(): ccfapp.Response<string> {
  return {
    statusCode: 200,
    headers: { "content-type": "text/html" },
    body: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="SwaggerUI" />
        <title>SwaggerUI</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
        <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js" crossorigin></script>
        <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js" crossorigin></script>
      </head>
      <body>
      <div id="swagger-ui"></div>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            urls: [
              {url: "/app/swagger.json", name: "Application API"}, /* '/app/api' will be used when ccf allow more control on openAPI document to be done through deployment bundle */
              {url: "/gov/api", name: "Governance API"},
              {url: "/node/api", name: "Operator API"}
            ],
            dom_id: '#swagger-ui',
            presets: [SwaggerUIBundle.presets.apis,SwaggerUIStandalonePreset],
            layout: "StandaloneLayout",
          });
        };
      </script>
      </body>
    </html>
    `
  };

}

/**
 * Return an OpenAPI document as the app documentation
 * this implementation should replace the usage of '/app/api' endpoint
 * when ccf allows more control of the openAPI document through the deployment bundle
 * https://github.com/microsoft/ccf-app-samples/issues/185
 */ 
export function getOpenApiDocument(): ccfapp.Response<object> {
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: openApiDoc
  };
}

/**
 * OpenAPI document 
 * This implementation should be replaced by the usage of '/app/api' endpoint when ccf allows 
 * more control of the openAPI document through the deployment bundle
 * https://github.com/microsoft/ccf-app-samples/issues/185
 */
const openApiDoc = {
  "openapi": "3.0.0",
  "info": {
    "title": "Data Reconciliation Application",
    "description": "The data reconciliation service is hosted on the CCF network, where users/members can submit their data to be reconciled against each other's data in a confidential manner and generate some data insights as a report",
    "version": "1.0.0"
  },
  "security": [{"Bearer": []}],
  "servers": [],
  "components": {
    "securitySchemes": {
      "Bearer": {
        "type": "apiKey",
        "description": "JWT Authorization header using the Bearer scheme.",
        "name": "Authorization",
        "in": "header",
        "scheme": "bearer",
        "bearerFormat": "JWT",
      }
    },
    "responses": {
      "default": {
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/CCFError"
            }
          }
        },
        "description": "An error occurred"
      }
    },
    "schemas": {
      "ApiResult": {
        "properties": {
          "content": {
            "type": "object"
          },
          "error": {
            "properties": {
              "errorMessage": {
                "type": "string"
              },
              "errorType": {
                "type": "string"
              }
            },
            "type": "object"
          },
          "failure": {
            "type": "boolean"
          },
          "status": {
            "type": "string"
          },
          "statusCode": {
            "type": "number"
          },
          "success": {
            "type": "boolean"
          }
        },
        "type": "object"
      },
      "CCFError": {
        "properties": {
          "error": {
            "properties": {
              "code": {
                "description": "Response error code. CCF error codes: https://microsoft.github.io/CCF/main/operations/troubleshooting.html#error-codes",
                "type": "string"
              },
              "message": {
                "description": "Response error message",
                "type": "string"
              }
            },
            "type": "object"
          }
        },
        "type": "object"
      },
      "CodeStatus": {
        "enum": [
          "AllowedToJoin"
        ],
        "type": "string"
      },
      "EndpointMetrics": {
        "properties": {
          "metrics": {
            "$ref": "#/components/schemas/EndpointMetricsEntry_array"
          }
        },
        "required": [
          "metrics"
        ],
        "type": "object"
      },
      "EndpointMetricsEntry": {
        "properties": {
          "calls": {
            "$ref": "#/components/schemas/uint64"
          },
          "errors": {
            "$ref": "#/components/schemas/uint64"
          },
          "failures": {
            "$ref": "#/components/schemas/uint64"
          },
          "method": {
            "$ref": "#/components/schemas/string"
          },
          "path": {
            "$ref": "#/components/schemas/string"
          },
          "retries": {
            "$ref": "#/components/schemas/uint64"
          }
        },
        "required": [
          "path",
          "method",
          "calls",
          "errors",
          "failures",
          "retries"
        ],
        "type": "object"
      },
      "EndpointMetricsEntry_array": {
        "items": {
          "$ref": "#/components/schemas/EndpointMetricsEntry"
        },
        "type": "array"
      },
      "GetCode__Out": {
        "properties": {
          "versions": {
            "$ref": "#/components/schemas/GetCode__Version_array"
          }
        },
        "required": [
          "versions"
        ],
        "type": "object"
      },
      "GetCode__Version": {
        "properties": {
          "digest": {
            "$ref": "#/components/schemas/string"
          },
          "status": {
            "$ref": "#/components/schemas/CodeStatus"
          }
        },
        "required": [
          "digest",
          "status"
        ],
        "type": "object"
      },
      "GetCode__Version_array": {
        "items": {
          "$ref": "#/components/schemas/GetCode__Version"
        },
        "type": "array"
      },
      "GetCommit__Out": {
        "properties": {
          "transaction_id": {
            "$ref": "#/components/schemas/TransactionId"
          }
        },
        "required": [
          "transaction_id"
        ],
        "type": "object"
      },
      "GetSnpHostDataMap__HostData": {
        "properties": {
          "metadata": {
            "$ref": "#/components/schemas/string"
          },
          "raw": {
            "$ref": "#/components/schemas/string"
          }
        },
        "required": [
          "raw",
          "metadata"
        ],
        "type": "object"
      },
      "GetSnpHostDataMap__HostData_array": {
        "items": {
          "$ref": "#/components/schemas/GetSnpHostDataMap__HostData"
        },
        "type": "array"
      },
      "GetSnpHostDataMap__Out": {
        "properties": {
          "host_data": {
            "$ref": "#/components/schemas/GetSnpHostDataMap__HostData_array"
          }
        },
        "required": [
          "host_data"
        ],
        "type": "object"
      },
      "GetTxStatus__Out": {
        "properties": {
          "status": {
            "$ref": "#/components/schemas/TxStatus"
          },
          "transaction_id": {
            "$ref": "#/components/schemas/TransactionId"
          }
        },
        "required": [
          "transaction_id",
          "status"
        ],
        "type": "object"
      },
      "TransactionId": {
        "pattern": "^[0-9]+\\.[0-9]+$",
        "type": "string"
      },
      "TxStatus": {
        "enum": [
          "Unknown",
          "Pending",
          "Committed",
          "Invalid"
        ],
        "type": "string"
      },
      "json": {},
      "string": {
        "type": "string"
      },
      "uint64": {
        "maximum": 18446744073709552000,
        "minimum": 0,
        "type": "integer"
      }
    },
    "x-ccf-forwarding": {
      "always": {
        "description": "If this request is made to a backup node, it will be forwarded to the primary node for execution.",
        "value": "always"
      },
      "never": {
        "description": "This call will never be forwarded, and is always executed on the receiving node, potentially breaking session consistency. If this attempts to write on a backup, this will fail.",
        "value": "never"
      },
      "sometimes": {
        "description": "If this request is made to a backup node, it may be forwarded to the primary node for execution. Specifically, if this request is sent as part of a session which was already forwarded, then it will also be forwarded.",
        "value": "sometimes"
      }
    }
  },
  "paths": {
    "/app/ingest": {
      "post": {
        "description": "Users or members submit their data to be reconciled",
        "summary": "Ingest data to be reconciled",
        "tags": ["Application API"],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "items": {
                  "properties": {
                    "lei": {
                      "type": "string"
                    },
                    "nace": {
                      "type": "string"
                    }
                  },
                  "type": "object"
                },
                "type": "array"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResult"
                }
              }
            },
            "description": "Ok"
          }
        }
      }
    },
    "/app/csv/ingest": {
      "post": {
        "description": "Users or members submit their data to be reconciled in csv formate",
        "summary": "Ingest data to be reconciled",
        "tags": ["Application API"],
        "requestBody": {
          "required": true,
          "content": {
            "text/csv": {
              "schema": { "type": "object" }
            }
          }
        },
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResult"
                }
              }
            },
            "description": "Ok"
          }
        }
      }
    },
    "/app/report": {
      "get": {
        "description": "Get the data reconciliation report for all ingested data",
        "summary": "Get the data reconciliation report for all ingested data",
        "tags": ["Application API"],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResult"
                }
              }
            },
            "description": "Ok"
          },
          "400": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResult"
                }
              }
            },
            "description": "Ok"
          }
        }
      }
    },
    "/app/report/{id}": {
      "get": {
        "description": "Get the data reconciliation report for specified record by supplying record id",
        "summary": "Get the data reconciliation report for specified record",
        "tags": ["Application API"],
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResult"
                }
              }
            },
            "description": "Ok"
          }
        }
      }
    },
    "/app/api": {
      "get": {
        "description": "Get the application OpenAPI schema",
        "summary": "Get the application OpenAPI schema",
        "tags": ["Metrics API"],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/json"
                }
              }
            },
            "description": "Default response description"
          },
          "default": {
            "$ref": "#/components/responses/default"
          }
        },
        "x-ccf-forwarding": {
          "$ref": "#/components/x-ccf-forwarding/sometimes"
        }
      }
    },
    "/app/api/metrics": {
      "get": {
        "description": "Usage metrics for endpoints",
        "summary": "Get the usage metrics for endpoints",
        "tags": ["Metrics API"],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EndpointMetrics"
                }
              }
            },
            "description": "Default response description"
          },
          "default": {
            "$ref": "#/components/responses/default"
          }
        },
        "x-ccf-forwarding": {
          "$ref": "#/components/x-ccf-forwarding/sometimes"
        }
      }
    },
    "/app/commit": {
      "get": {
        "description": "Current commit level",
        "summary": "Current commit level, Latest transaction ID that has been committed on the service",
        "tags": ["Metrics API"],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GetCommit__Out"
                }
              }
            },
            "description": "Default response description"
          },
          "default": {
            "$ref": "#/components/responses/default"
          }
        },
        "x-ccf-forwarding": {
          "$ref": "#/components/x-ccf-forwarding/sometimes"
        }
      }
    },
    "/app/receipt": {
      "get": {
        "description": "Receipt for a transaction",
        "summary": "Get a signed statement from the service over a transaction entry in the ledger",
        "tags": ["Metrics API"],
        "parameters": [
          {
            "in": "query",
            "name": "transaction_id",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/TransactionId"
            }
          }
        ],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/json"
                }
              }
            },
            "description": "Default response description"
          },
          "default": {
            "$ref": "#/components/responses/default"
          }
        },
        "x-ccf-forwarding": {
          "$ref": "#/components/x-ccf-forwarding/sometimes"
        }
      }
    },
    "/app/code": {
      "get": {
        "description": "",
        "summary": "",
        "tags": ["Metrics API"],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GetCode__Out"
                }
              }
            },
            "description": "Default response description"
          },
          "default": {
            "$ref": "#/components/responses/default"
          }
        },
        "x-ccf-forwarding": {
          "$ref": "#/components/x-ccf-forwarding/sometimes"
        }
      }
    },
    "/app/snp/measurements": {
      "get": {
        "description": "",
        "summary": "",
        "tags": ["Metrics API"],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GetCode__Out"
                }
              }
            },
            "description": "Default response description"
          },
          "default": {
            "$ref": "#/components/responses/default"
          }
        },
        "x-ccf-forwarding": {
          "$ref": "#/components/x-ccf-forwarding/sometimes"
        }
      }
    },
    "/app/snp/host_data": {
      "get": {
        "description": "",
        "summary": "",
        "tags": ["Metrics API"],
        "parameters": [
          {
            "in": "query",
            "name": "key",
            "required": false,
            "schema": {
              "$ref": "#/components/schemas/string"
            }
          }
        ],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GetSnpHostDataMap__Out"
                }
              }
            },
            "description": "Default response description"
          },
          "default": {
            "$ref": "#/components/responses/default"
          }
        },
        "x-ccf-forwarding": {
          "$ref": "#/components/x-ccf-forwarding/sometimes"
        }
      }
    },
    "/app/tx": {
      "get": {
        "description": "get current status of a transaction",
        "summary": "get current status of a transaction, Possible statuses returned are Unknown, Pending, Committed or Invalid.",
        "tags": ["Metrics API"],
        "parameters": [
          {
            "in": "query",
            "name": "transaction_id",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/TransactionId"
            }
          }
        ],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GetTxStatus__Out"
                }
              }
            },
            "description": "Default response description"
          },
          "default": {
            "$ref": "#/components/responses/default"
          }
        },
        "x-ccf-forwarding": {
          "$ref": "#/components/x-ccf-forwarding/sometimes"
        }
      }
    },
    "/app/local_tx": {
      "get": {
        "description": "",
        "summary": "",
        "tags": ["Metrics API"],
        "parameters": [
          {
            "in": "query",
            "name": "transaction_id",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/TransactionId"
            }
          }
        ],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GetTxStatus__Out"
                }
              }
            },
            "description": "Default response description"
          },
          "default": {
            "$ref": "#/components/responses/default"
          }
        },
        "x-ccf-forwarding": {
          "$ref": "#/components/x-ccf-forwarding/sometimes"
        }
      }
    }
  }
};