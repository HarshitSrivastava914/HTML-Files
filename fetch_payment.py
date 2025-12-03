import razorpay
import json

def main():
    # Initialize Razorpay client
    client = razorpay.Client(auth=("rzp_test_RhU5h8nLmBqdJK", "v11K7EB0dtBCvUhvYQJiT0ms"))

    # Payment ID to fetch
    payment_id = "pay_RmEysc8BJKvpBD"

    try:
        # Fetch payment details
        response = client.payment.fetch(payment_id)

        # Print raw response
        print("Raw Response:")
        print(response)

        # Convert to JSON and pretty-print
        print("\nJSON Formatted Response:")
        print(json.dumps(response, indent=4))

    except Exception as e:
        print("Error fetching payment:")
        print(e)

if __name__ == "__main__":
    main()
