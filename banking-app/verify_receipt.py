import json
import hashlib
import sys
from cryptography.x509 import load_pem_x509_certificate
from cryptography.hazmat.backends import default_backend
import ccf.receipt

# Input: Takes response body of banking-app's /app/receipt from stdin.
# Output: When the verification is successful, it writes "OK" to stdout. Otherwise it writes "Verify failed" to stderr and results in an exit code of 1.

json_as_str = input()
json_obj = json.loads(json_as_str)
claim = json_obj["leaf_components"]["claim"]
claims_digest = hashlib.sha256(claim.encode()).digest()
commit_evidence_digest = hashlib.sha256(json_obj["leaf_components"]["commit_evidence"].encode()).digest()
write_set_digest = bytes.fromhex(json_obj["leaf_components"]["write_set_digest"])

leaf = (hashlib.sha256(write_set_digest + commit_evidence_digest + claims_digest).digest().hex())
root = ccf.receipt.root(leaf, json_obj["proof"])
node_cert = load_pem_x509_certificate(json_obj["cert"].encode(), default_backend())
try:
    ccf.receipt.verify(root, json_obj["signature"], node_cert)
    print("OK")
except Exception as e:
    sys.exit(f"Verify failed: {type(e)}")
