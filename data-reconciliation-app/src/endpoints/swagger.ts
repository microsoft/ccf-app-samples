import * as ccfapp from "@microsoft/ccf-app";

export function getSwaggerUI(): ccfapp.Response<string> {
  return {
    statusCode: 200,
    headers: { "content-type": "text/html" },
    body: `<html>
            <head>    
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.17.0/swagger-ui.css">
                <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.17.0/swagger-ui-bundle.js"></script>
                <script>
                    function render() {
                        var ui = SwaggerUIBundle({
                            url:  '/app/swagger.json',
                            dom_id: '#swagger-ui',
                            presets: [
                                SwaggerUIBundle.presets.apis,
                                SwaggerUIBundle.SwaggerUIStandalonePreset
                            ]
                        });
                    }
                </script>
            </head>
            <body onload="render()">
                <div id="swagger-ui"></div>
            </body>
          </html>`
  };

}

// return an OpenAPI document as the app documentation
export function getOpenApiDocument(): ccfapp.Response<object> {
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: openApiDoc
  };
}


const openApiDoc = {
  "components": {
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
      },
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
  "info": {
    "description": "Data Reconciliation Application",
    "title": "Data Reconciliation Application",
    "version": "1.0.0"
  },
  "openapi": "3.0.0",
  "paths": {
    "/app/api": {
      "get": {
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
    "/app/code": {
      "get": {
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
    "/app/commit": {
      "get": {
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
    "/app/local_tx": {
      "get": {
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
    "/app/receipt": {
      "get": {
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
    "/app/snp/host_data": {
      "get": {
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
    "/app/snp/measurements": {
      "get": {
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
    "/app/tx": {
      "get": {
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
    "/app/ingest": {
      "post": {
        "description": "Users or members submit their data to be reconciled",
        "summary": "Ingest data to be reconciled",
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
    "/app/report": {
      "get": {
        "description": "Get the data reconciliation report for all ingested data",
        "summary": "Get the data reconciliation report for all ingested data",
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
    "/app/report/{id}": {
      "get": {
        "description": "Get the data reconciliation report for specified record by supplying record id",
        "summary": "Get the data reconciliation report for specified record",
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
    }
  },
  "servers": []
};