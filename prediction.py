import json
import sys

raw_output = {
  "prediction": 123.2354,
  "accuracy": 2134.3122,
  "hyperparams": sys.argv[1]
} 

json_output = json.dumps(raw_output)

print(json_output)