import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testEndpoint(name, url, options = {}) {
    console.log(`\n=== ${name} ===`);
    try {
        const response = await fetch(url, options);
        const contentType = response.headers.get('content-type');

        console.log(`Status: ${response.status}`);

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log(' Success:', JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            if (response.ok) {
                console.log('Success:', text);
            } else {
                console.log(' Failed:', text.substring(0, 200));
            }
        }
    } catch (error) {
        console.log(' Error:', error.message);
    }
}

async function runTests() {
    console.log(' Testing Restaurant A2A Server\n');
    await testEndpoint(
        'Health Check',
        `${BASE_URL}/health`
    );
    await testEndpoint(
        'Agent Card',
        `${BASE_URL}/.well-known/agent.json`
    );
    await testEndpoint(
        'Direct LangGraph Test',
        `${BASE_URL}/test-langgraph`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Show me the menu' })
        }
    );
    const a2aMessage = {
        message: {
            messageId: "test-123",
            role: "user",
            parts: [{ kind: "text", text: "Hello, show me the menu" }]
        },
        contextId: "test-context"
    };

    await testEndpoint(
        'A2A Execute',
        `${BASE_URL}/execute`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(a2aMessage)
        }
    );
    const orderMessage = {
        message: {
            messageId: "test-456",
            role: "user",
            parts: [{ kind: "text", text: "I want to order 2 pizzas for John Doe, phone 555-1234" }]
        },
        contextId: "test-order"
    };

    await testEndpoint(
        'Restaurant Order Test',
        `${BASE_URL}/execute`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderMessage)
        }
    );

    console.log('\n Testing complete!');
}

runTests().catch(console.error);