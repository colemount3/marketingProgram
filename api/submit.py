import json

def handler(request):
    if request.method == "POST":
        try:
            # Retrieve JSON data from the POST request body
            body = request.json()  # Assuming the frontend sends JSON data
            
            # Check if all required fields are provided (you can validate here)
            if 'companyName' not in body or 'contactInfo' not in body:
                return json.dumps({"error": "Missing required fields"}), 400
            
            # For debugging, log the received data
            print(f"Received data: {body}")
            
            # Process the form data, save it, or trigger another action as needed.
            # Example response:
            return json.dumps({"message": "Form submitted successfully!"}), 200
        except Exception as e:
            # Handle errors gracefully and return an error message
            return json.dumps({"error": f"Server error: {str(e)}"}), 500
    else:
        return json.dumps({"error": "Invalid request method"}), 405
