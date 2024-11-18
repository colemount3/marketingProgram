from flask import Flask, request, jsonify
import openai
import os
import zipfile
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

app = Flask(__name__)

# Set your OpenAI API key
openai.api_key = os.getenv("APIKEY")

@app.route('/submit', methods=['POST'])
def handle_submission():
    # Collect data from form
    company_name = request.form['companyName']
    contact_info = request.form['contactInfo']
    client_contact_info = request.form['clientContactInfo']
    industry = request.form['industry']
    mood = request.form['mood']
    content_types = request.form.getlist('contentType')
    platforms = request.form['platforms']
    timeframe = request.form['timeframe']
    target_clients = request.form['targetClients']
    marketing_points = request.form['marketingPoints']
    seasonal_promotions = request.form['seasonalPromotions']
    additional_info = request.form['additionalInfo']

    # Prepare GPT-4 prompt
    prompt = f"Generate marketing materials for {company_name} in the {industry} industry..."
    # Add more to the prompt using the collected data

    # Call GPT-4
    response = openai.Completion.create(
        engine="gpt-4",
        prompt=prompt,
        max_tokens=1500
    )

    # Generate and save documents based on GPT-4 response
    materials = response.choices[0].text

    # Create individual documents and zip them
    zip_filename = "marketing_materials.zip"
    with zipfile.ZipFile(zip_filename, 'w') as zipf:
        for idx, content in enumerate(materials.split('\n\n')):
            filename = f"material_{idx+1}.txt"
            with open(filename, 'w') as file:
                file.write(content)
            zipf.write(filename)
            os.remove(filename)

    # Send the zip file via email
    sender_email = os.getenv("EMAIL")
    receiver_email = contact_info
    password = os.getenv("PW")  # Use environment variables for security

    msg = MIMEMultipart()
    msg['From'] =  os.getenv("EMAIL")
    msg['To'] = receiver_email
    msg['Subject'] = "Your Marketing Materials"

    with open(zip_filename, 'rb') as attachment:
        part = MIMEBase('application', 'octet-stream')
        part.set_payload(attachment.read())
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', f'attachment; filename= {zip_filename}')
        msg.attach(part)

   with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login(sender_email, password)
        server.send_message(msg)

    os.remove(zip_filename)  # Clean up zip file

    return jsonify({"message": "Marketing materials sent successfully!"})

if __name__ == '__main__':
    app.run(debug=True)
