import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { Show, createSignal, createEffect } from "solid-js";

import Header from "../components/Header";
import Loading from "../components/Loading";
import MakeOnlinePayment from "../components/MakeOnlinePayment";
import SuccessBlock from "../components/SuccessfulBlock";

export default function PortalWallet() {
  const VITE_API_URL = import.meta.env.VITE_API_URL;
  const GATEWAY = import.meta.env.VITE_GATEWAY;
  const PRIVK = import.meta.env.VITE_PRIVKEY;

  const [loading, setLoading] = createSignal(true);
  const [portalWallet, setPortalWallet] = createSignal(null);
  const navigate = useNavigate();
  const [showInput, setShowInput] = createSignal(false);

  const [amount, setAmount] = createSignal("");
  const [transRefCode, setTransRefCode] = createSignal("");
  const [transactSuccessful, setTransactionSuccessful] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [currentWBalance, setCurrentWBalance] = createSignal(null);
  const [settlementAmount, setSettlementAmount] = createSignal(null);
  const [studentId, setStudentId] = createSignal("");
  const [studentEmail, setStudentEmail] = createSignal("");
  const [custId, setCustId] = createSignal("");
  const [refPresent, setRefPresent] = createSignal(true);
  const [hasProcessedSuccess, setHasProcessedSuccess] = createSignal(false);
  const [isCreditSuccessful, setIsCreditSuccessful] = createSignal(false);

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  /**
   * Fetches user data from localStorage
   * @returns {Object|null} Parsed user object or null
   */
  const getUserData = () => {
    const user = localStorage.getItem("jetsUser");
    return user ? JSON.parse(user) : null;
  };
  
  /**
   * Fetches the user's portal wallet details from the API
   * @param {string} userId - The user ID obtained from stored data
   */
  const fetchPortalWallet = async (userId) => {
    try {
      // console.log("this is the userid: "+userId)
      const user = getUserData();
      if (!user) return;
      
      const response = await fetch(`${VITE_API_URL}/api/portal-wallet/${userId}`, {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "GET",
      });

      const data = await response.json();
      //console.log(parseFloat(data.response.amount) + 100)
      if (data.success) {
        setPortalWallet(data.response);
        const currentbalance = parseFloat(data?.response?.amount) || 0;
        setCurrentWBalance(currentbalance);
        // console.log("this is current walletbalance: "+currentWBalance());
        setLoading(false);        
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    }
  };

  createEffect(async () => {
    const user = getUserData();
    if (user) {
      try {
        setCustId(user.custom_id);
        const response = await fetch(`${VITE_API_URL}/api/user/` + custId(), {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        });

        const data = await response.json();
        // console.log(data);
        setStudentId(data.response.username);
        fetchPortalWallet(data.response.custom_id);        
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      navigate("/", { replace: true });
    }
  });  
  
  const updateWallet = async (custom_id, txamount, referenceId) => {
    try{
      const response = await fetch (VITE_API_URL + '/api/edit-portal-wallet/' + custom_id, {
        mode:"cors",
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("jetsUser")).token
          }`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "PATCH",
        body:JSON.stringify({
          amount: txamount,
          tx_ref_ids: referenceId,
        }),
      });
      const data = await response.json();
      if (data.success === true){
        setCurrentWBalance(txamount);
        return true;
      }
      else{
        console.log("verification failed");
        return false;
      }
    }
    catch(error){
      console.error("Wallet update error: ", error);
      throw error; //to be caught in caller
    }
  }

  const handlePayment = () => {
    MakeOnlinePayment({amount: Number(amount())})
  };

  const handleVerification = async () => {    
    setMessage("");
    setTransactionSuccessful("");
    setHasProcessedSuccess(false);

    try{
      const response = await fetch(GATEWAY + "/transaction/" + transRefCode() + "/verify", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: PRIVK,
        }
      });

      const data = await response.json()

      if (data.status === 200 && data.message === "Successfully processed") {
        if (hasProcessedSuccess()){
          setMessage("This Transaction was already processed successfully");
          setTimeout(() => setMessage(""), 5000);
          return;
        }
        // console.log(data);
        var initialPortalBalance = currentWBalance();
        var email = data.data["customerId"];
        var transRef = data.data["transRef"];
        var _studentId = data.data["metadata"][0]["insightTagValue"];
        var tx_ref_ids = portalWallet().tx_ref_ids;
        var txAmount = data.data["transAmount"];
        var refExists = tx_ref_ids.includes(transRef);
        setRefPresent(refExists);
        var verifyStudent = studentId() === _studentId;
        var txRefList = tx_ref_ids.split(", ").map(s => s.replace(/"/g, ""));

        setTransactionSuccessful("Successfully processed");
        setHasProcessedSuccess(true);
        
        if (!refExists && verifyStudent){
          txRefList.push(transRef);

          const refsToPush = txRefList.map(s => `"${s}"`).join(", "); //deconstruct to db format
          const newPortalBalance = initialPortalBalance + txAmount;

          await updateWallet(custId(), newPortalBalance, refsToPush);
          setRefPresent(true);

          setMessage("Transaction Successful! Your account balance has been credited!");
          setIsCreditSuccessful(true);
          
        }
        else{
          setMessage(refExists ? "This reference code has already been used." : "Transaction not associaed with your account");
        }                     
      }
      else if(data.status === 404){
        setMessage("Transaction ID, not found! Please input a valid ID");
        
      }
      else{
        // console.error("Verification Failed. Try Again or Contact the ICT.");
        setMessage("Verification Failed. Try Again or Contact the ICT.")            
      }
      setTimeout(() => setMessage(""), 5000);          
    }
    catch (error){
      console.error("Verification Error: ",error);
      setMessage("Network error during verification");
      setTimeout(() => setMessage(""), 5000);
    }
  }

  return (
    <MetaProvider>
      <Title>Portal Wallet - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="My Portal Wallet on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm px-4 md:px-8 lg:px-16">
        <Header />
        <Show when={!loading()} fallback={<Loading />}>
          <div class="mt-8 mb-20 w-full max-w-4xl mx-auto space-y-4">
            <h2 class="text-lg font-semibold text-center border-b-2 border-red-600 pb-2">
              Portal Wallet
            </h2>
            <div class="bg-yellow-100 rounded-md border border-yellow-200 p-3">
              <b class="block">Instructions:</b>
              <p>
                1. Make a bank transfer using the details provided below. <br/>
                2. Alternatively, use the payment link for an easier transaction.<br/>
                3. Proceed to the Bursary with proof of payment to obtain an official school receipt.<br/>
                4. Before submission and printing, verify that your portal wallet details for the semester are correct.
              </p>
            </div>
            <div class="border border-gray-300 shadow-lg rounded-md p-4 bg-white">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-green-200 border border-green-300 p-6 rounded-lg shadow-md flex flex-col items-start justify-center">
                  <h2 class="text-lg font-semibold">Balance:</h2>
                  <div class="text-3xl font-bold">
                    {/* {console.log("Balance from within: ",portalWallet().amount)} */}
                    {formatter.format(currentWBalance())}
                  </div>
                </div>
                <div class="space-y-4">
                  {[{
                    title: "Undergraduate",
                    bank: "First Bank",
                    account: "3046504114",
                  }, {
                    title: "Postgraduate",
                    bank: "Access Bank",
                    account: "0002620312",
                  }].map(({ title, bank, account }) => (
                    <div class="bg-gray-50 p-4 rounded-md shadow-sm">
                      <h2 class="font-semibold underline text-blue-900 text-lg">{title}</h2>
                      <p>
                        {/* Transfer or deposit into:
                        <br /> */}
                        <b>ECWA Theological Seminary</b>, <b>{bank}</b>, <b>{account}</b>
                        {/* <br />
                        Proceed to Bursary & obtain official school receipt. Your Wallet will be updated immediately. */}
                      </p>
                    </div>
                  ))}
                  
                  <div class="bg-gray-50 p-4 rounded-md shadow-sm cursor-pointer" 
                      onclick={() => setShowInput(!showInput())}>
                    <h2 class="font-semibold underline text-blue-900 text-lg">Secure Online Payment</h2>
                  </div>
                  {showInput() && (
                    <div class="space-y-4">
                    <div>
                      <input
                        type="number"
                        class="p-2 border border-gray-300 rounded-md w-full"
                        placeholder="Enter amount"
                        min="1"
                        value={amount()}
                        onInput={(e) => {
                          const value = e.target.value;
                          if (/^\d*$/.test(value)) setAmount(value); // Allow only positive numbers
                        }}
                      />
                      <button
                        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mt-2"
                        onClick={handlePayment}
                      >
                        Proceed with Payment
                      </button>
                    </div>
                  
                    <div style={{ position: "relative", display: "inline-block" }}> 
                      <input
                        type="text"
                        class="p-2 border border-gray-300 rounded-md w-full"
                        placeholder="Enter Transaction Ref. Code"
                        min="1"
                        value={transRefCode()}
                        onInput={(e) => {
                          const value = e.target.value;
                          setTransRefCode(value); // Allow only positive numbers
                        }}
                      />
                      <button
                        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mt-2"
                        classList={{
                          "opacity-50 cursor-not-allowed": isCreditSuccessful(),
                          "hover:bg-blue-700": !isCreditSuccessful()
                        }}
                        onClick={handleVerification}
                        disabled={isCreditSuccessful()}
                      >
                        Verify Payment
                      </button>
                    </div>        
                            
                  </div>                 
                    
                  )  
                  }                                  
                </div>
                
              </div>
            </div>
          </div>
        </Show>
      </div>
      <div>        
      <Show when={message() !== ""}>
        <h1 style={{
          position: "fixed",
          // top: "70%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: "20px",
          background: message() === "Transaction Successful! Your account balance has been credited!"
            ? "rgba(0, 255, 110, 0.7)"  // Green for success
            : "rgba(255, 0, 0, 0.77)",   // Red for other messages
          color: message() === "Transaction Successful! Your account balance has been credited!"
            ? "#001a00" // Dark green text for contrast
            : "black",  // Black for error messages
          "font-weight": "bold",
          borderRadius: "10px",
          textAlign: "center",
          zIndex: "1000",
          whiteSpace: "pre-line"
        }}>
          {message()}
        </h1>
      </Show>
      </div>
    </MetaProvider>
  );
}
