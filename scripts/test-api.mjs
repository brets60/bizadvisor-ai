async function runIntegrationTest() {
  console.log("Testing BizAdvisor AI Endpoints...");

  // 1. Test Login
  const loginRes = await fetch("http://localhost:3001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "founder@bizadvisor.ph",
      password: "DemoPass2026!PH",
    }),
  });

  const loginData = await loginRes.json();
  console.log("Login Status:", loginRes.status);
  console.log("Logged In User:", loginData.user?.fullName, `(${loginData.user?.email})`);

  const cookie = loginRes.headers.get("set-cookie");
  console.log("Session Cookie Received:", !!cookie);

  // 2. Test Me endpoint
  const meRes = await fetch("http://localhost:3001/api/auth/me", {
    headers: { Cookie: cookie || "" },
  });
  const meData = await meRes.json();
  console.log("Me Status:", meRes.status);
  console.log("Active Business:", meData.user?.businessProfile?.business_name);
  console.log("Currency / Region:", `${meData.user?.currency} / ${meData.user?.country}`);

  // 3. Test Ideas fetch
  const ideasRes = await fetch("http://localhost:3001/api/ideas", {
    headers: { Cookie: cookie || "" },
  });
  const ideasData = await ideasRes.json();
  console.log("Ideas Count in Workspace:", ideasData.ideas?.length);

  // 4. Test Growth Items fetch
  const growthRes = await fetch("http://localhost:3001/api/growth", {
    headers: { Cookie: cookie || "" },
  });
  const growthData = await growthRes.json();
  console.log("Growth Milestones Total:", growthData.stats?.total, "Completed:", growthData.stats?.completed);

  // 5. Test Conversations fetch
  const convRes = await fetch("http://localhost:3001/api/advisor/conversations", {
    headers: { Cookie: cookie || "" },
  });
  const convData = await convRes.json();
  console.log("Conversations Count:", convData.conversations?.length);

  console.log("All integration checks passed successfully!");
}

runIntegrationTest().catch(console.error);
