async function verifyAll() {
  console.log("====================================================");
  console.log("VERIFYING LIVE WEB FRONTEND AND REST API ENDPOINTS");
  console.log("====================================================\n");

  const endpoints = [
    { url: "http://localhost:3000/", name: "Master Landing Gateway", expected: "L & K" },
    { url: "http://localhost:3000/lakshmi-pharma", name: "Lakshmi Pharma Home Page", expected: "Lakshmi Pharma" },
    { url: "http://localhost:3000/lakshmi-pharma/products", name: "Lakshmi Pharma Products Catalog", expected: "Composition-Based Product Directory" },
    { url: "http://localhost:3000/lakshmi-pharma/products/dolo-650", name: "Dolo 650 Text-Only Specification Page", expected: "Products with matching composition" },
    { url: "http://localhost:3000/lakshmi-pharma/manufacturers", name: "Authorized Manufacturers Directory", expected: "Authorized Pharmaceutical Manufacturers" },
    { url: "http://localhost:3000/lakshmi-pharma/about", name: "Lakshmi Pharma About & Compliance Page", expected: "About Lakshmi Pharma" },
    { url: "http://localhost:3000/lakshmi-pharma/contact", name: "Lakshmi Pharma Trade Desk & Contact Page", expected: "Submit Wholesale Trade Inquiry" },
    { url: "http://localhost:3000/kothittil-pharma/products", name: "The Kothittil Pharma Products Catalog", expected: "The Kothittil Pharma Catalog" },
    { url: "http://localhost:3000/admin/login", name: "Administrator Authentication Page", expected: "Distributor Management Portal" },
  ];

  let passes = 0;
  let fails = 0;

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url);
      const text = await res.text();
      const statusOk = res.status === 200;
      const contentMatches = text.includes(ep.expected);

      if (statusOk && contentMatches) {
        console.log(`[PASS] ${ep.name} (Status: ${res.status})`);
        passes++;
      } else {
        console.error(`[FAIL] ${ep.name} (Status: ${res.status}, Match: ${contentMatches})`);
        fails++;
      }
    } catch (e: any) {
      console.error(`[FAIL] ${ep.name} (Error: ${e.message})`);
      fails++;
    }
  }

  // Verify API Inquiry Submission
  console.log("\n--- Testing Live B2B Inquiry Submission via API ---");
  try {
    const inquiryPayload = {
      name: "Dr. Anirudh Menon",
      businessName: "Ernakulam Specialty Care Hospital",
      email: "procurement@ernakulamcare.demo",
      phone: "+91 94470 55667",
      message: "Monthly requirements contract for 200 boxes of Dolo 650 strips.",
    };

    const res = await fetch("http://localhost:5000/api/companies/lakshmi-pharma/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inquiryPayload),
    });
    const data = await res.json();

    if (res.status === 201 && data.success) {
      console.log(`[PASS] B2B Inquiry submitted successfully (ID: ${data.inquiryId})`);
      console.log(`       ↳ Response message: "${data.message}"`);
      passes++;
    } else {
      console.error(`[FAIL] B2B Inquiry failed:`, data);
      fails++;
    }
  } catch (e: any) {
    console.error(`[FAIL] B2B Inquiry error:`, e.message);
    fails++;
  }

  // Verify Admin Login & Token Generation
  console.log("\n--- Testing Admin Login & Role Authorization ---");
  try {
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "superadmin@lkpharma.demo",
        password: "SuperAdmin@2026",
      }),
    });
    const loginData = await loginRes.json();

    if (loginRes.status === 200 && loginData.token && loginData.user.role === "SUPER_ADMIN") {
      console.log(`[PASS] Super Admin authenticated (User: ${loginData.user.name}, Role: ${loginData.user.role})`);
      passes++;

      // Verify Admin Inquiries fetch
      const inqRes = await fetch("http://localhost:5000/api/admin/inquiries", {
        headers: { Authorization: `Bearer ${loginData.token}` },
      });
      const inqData = await inqRes.json();
      if (inqRes.status === 200 && Array.isArray(inqData.data)) {
        console.log(`[PASS] Admin inquiries fetched with JWT authorization (${inqData.data.length} inquiries found)`);
        passes++;
      } else {
        console.error("[FAIL] Admin inquiries fetch failed");
        fails++;
      }
    } else {
      console.error("[FAIL] Super Admin login failed:", loginData);
      fails++;
    }
  } catch (e: any) {
    console.error(`[FAIL] Admin login error:`, e.message);
    fails++;
  }

  console.log("\n====================================================");
  console.log(`END-TO-END VERIFICATION: ${passes} PASSED, ${fails} FAILED`);
  console.log("====================================================");

  if (fails > 0) process.exit(1);
}

verifyAll();
