# api/submit.py
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Parse the content length
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        # Parse the JSON body
        try:
            data = json.loads(post_data)
            # Extract data from the request
            company_name = data.get("companyName")
            contact_info = data.get("contactInfo")
            client_contact_info = data.get("clientContactInfo")
            industry = data.get("industry")
            mood = data.get("mood")
            content_type = data.get("contentType")
            platforms = data.get("platforms")
            timeframe = data.get("timeframe")
            target_clients = data.get("targetClients")
            marketing_points = data.get("marketingPoints")
            seasonal_promotions = data.get("seasonalPromotions")
            additional_info = data.get("additionalInfo")

            # Here, handle the form submission (e.g., save to a database, send an email, etc.)
            print("Form Data:", data)

            # Send a success response
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"message": "Form submitted successfully!"}).encode("utf-8"))
        except Exception as e:
            # Handle errors
            self.send_response(500)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
