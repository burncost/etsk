import { createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";

// const navigate = useNavigate();

export default function MakeOnlinePayment({ amount }) {
    const VITE_API_URL = import.meta.env.VITE_API_URL;
    const PUBK = import.meta.env.VITE_PUBKEY;
    const GATEWAY = import.meta.env.VITE_GATEWAY;
    
    const [studentData, setStudentData] = createSignal(null);
    const [userData, setUserData] = createSignal(null);
    const [paymentStatus, setPaymentStatus] = createSignal(null);

    const getUserData = () => {
        const user = localStorage.getItem("jetsUser");
        return user ? JSON.parse(user) : null;
    };

    const fetchUserData = async () => {
        try {
            const user = getUserData();
            if (!user) return;

            const [userResponse, studentResponse] = await Promise.all([ 
                fetch(`${VITE_API_URL}/api/user/${user.custom_id}`, {
                    mode: "cors",
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    method: "GET",
                }),
            fetch(`${VITE_API_URL}/api/student/${user.custom_id}`, {
                    mode: "cors",
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    method: "GET",
                })
            ]);

            const [uData, sData] = await Promise.all([userResponse.json(), studentResponse.json()]);
            if (!uData.success) throw new Error("Failed to fetch user data: ", uData.response);
            if (!sData.success) throw new Error("Failed to fetch student data: ", sData.response);

            // console.log("Fetched user data:", uData.response);
            // console.log("Fetched student data:", sData.response);
            setStudentData(sData.response);
            setUserData(uData.response);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    // Fetch user data when component mounts
    createEffect(() => {
        fetchUserData();
    });

    createEffect(() => {
        if (!studentData() || !userData()) return; // Wait until student data is loaded

        const paymentData = {
            "amount": Number(amount)*100,
            "bearer": 0,
            "callbackUrl": "https://jetsportal.com.ng/student/portal-wallet",
            "channels": ["card", "bank"],
            "currency": "NGN",
            "transRef": "Jets4589hg536",
            "customerFirstName": userData().first_name || "",
            "customerLastName": userData().surname || "",
            "customerPhoneNumber": userData().phone_number || studentData.phone_number,
            "email": studentData().email || "",
            "metadata": {
                "customFields": [
                {
                    "variable_name": "student_id",
                    "value": userData().username || "",
                    "display_name": "Student ID",
                },
            ]},
        };
        // console.log('amount: ',paymentData["amount"])
        // console.log('first name: ',paymentData["customerFirstName"])
        // console.log('last name: ',paymentData["customerLastName"])
        // console.log('phonenumber: ',paymentData["customerPhoneNumber"])
        // console.log('email: ',paymentData["email"])
        // console.log('student id: ', paymentData.metadata["customFields"][0]["value"])

        fetch(GATEWAY + "/transaction/initialize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: PUBK,
            },
            body: JSON.stringify(paymentData),
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log("This is returned: ",data);
                var authUrl = data.data["authorizationUrl"];

                if (data.status === 200 && data.data?.authorizationUrl) {
                    window.location.href = authUrl
                }
                else{
                    console.error("Payment failed or no authorization URL found.");
                }
            })
            .catch((error) => console.error("Payment error:", error));
    });

    
}
