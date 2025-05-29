
import requests
import json
import sys
import time
from datetime import datetime

class HajaBotAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_phone = f"5511999{int(time.time()) % 1000000}"  # Generate a unique test phone number
        self.created_lead_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            
            status_success = response.status_code == expected_status
            
            # Try to parse response as JSON
            try:
                response_data = response.json()
                print(f"Response: {json.dumps(response_data, indent=2)}")
            except:
                response_data = response.text
                print(f"Response (text): {response_data}")
            
            if status_success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
            
            return status_success, response_data
        
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_health_check(self):
        """Test the health check endpoint"""
        return self.run_test(
            "Health Check",
            "GET",
            "",
            200
        )

    def test_get_leads(self):
        """Test getting all leads"""
        return self.run_test(
            "Get All Leads",
            "GET",
            "api/leads",
            200
        )

    def test_get_leads_with_filter(self):
        """Test getting leads with filter"""
        return self.run_test(
            "Get Leads with Filter",
            "GET",
            "api/leads",
            200,
            params={"status": "novo"}
        )

    def test_create_lead_via_form(self):
        """Test creating a lead via form submission"""
        data = {
            "nome": "Test User",
            "telefone": self.test_phone,
            "cep": "01234567",
            "plano": "Básico"
        }
        
        success, response = self.run_test(
            "Create Lead via Form",
            "POST",
            "api/form",
            201,
            data=data
        )
        
        if success and response and 'lead' in response:
            self.created_lead_id = response['lead']['id']
            print(f"Created lead with ID: {self.created_lead_id}")
        
        return success, response

    def test_webhook_message(self):
        """Test the webhook endpoint for WhatsApp messages"""
        data = {
            "sender": self.test_phone,
            "senderName": "Test Webhook User",
            "message": "This is a test message from webhook"
        }
        
        return self.run_test(
            "Process Webhook Message",
            "POST",
            "api/webhook",
            200,
            data=data
        )

    def test_send_manual_message(self):
        """Test sending a manual message"""
        data = {
            "phone": self.test_phone,
            "message": "This is a test manual message"
        }
        
        return self.run_test(
            "Send Manual Message",
            "POST",
            "api/send",
            200,
            data=data
        )

    def test_update_lead_status(self):
        """Test updating a lead status"""
        if not self.created_lead_id:
            print("❌ Cannot test lead status update - no lead was created")
            return False, None
        
        data = {
            "status": "em_atendimento"
        }
        
        return self.run_test(
            "Update Lead Status",
            "PUT",
            f"api/leads/{self.created_lead_id}",
            200,
            data=data
        )

    def test_get_lead_messages(self):
        """Test getting messages for a lead"""
        if not self.created_lead_id:
            print("❌ Cannot test get lead messages - no lead was created")
            return False, None
        
        return self.run_test(
            "Get Lead Messages",
            "GET",
            f"api/leads/{self.created_lead_id}/messages",
            200
        )

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting HajaBot API Tests")
        print(f"🔗 Base URL: {self.base_url}")
        print("=" * 50)
        
        # Health check
        self.test_health_check()
        
        # Lead creation and management
        self.test_create_lead_via_form()
        self.test_get_leads()
        self.test_get_leads_with_filter()
        
        # Webhook and messaging
        self.test_webhook_message()
        self.test_send_manual_message()
        
        # Lead updates and messages
        if self.created_lead_id:
            self.test_update_lead_status()
            self.test_get_lead_messages()
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"📊 Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    # Get the backend URL from environment or use default
    backend_url = "https://54b6e021-1d4c-4690-8f48-aa361d81b5c6.preview.emergentagent.com"
    
    # Run tests
    tester = HajaBotAPITester(backend_url)
    success = tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
