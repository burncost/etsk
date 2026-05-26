import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate, useParams } from "@solidjs/router";

import Header from "../components/Header";
import { createSignal, createResource } from "solid-js";
import { createStore } from "solid-js/store";
import Loading from "../components/Loading";
import BursarHostelConfirmationForm from "../components/BursarHostelConfirmationForm";
import PorterRejectionForm from "../components/PorterRejectionForm";
import { Select } from "../components/Select";
import Success from "../components/icons/Success";

const schema = z.object({
  rooms: z.string().min(1, "*Required"),
  beds: z.string().min(1, "*Required"),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function HostelForm() {
  const navigate = useNavigate();

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const [notRegistered, setNotRegistered] = createSignal(false);
  const [user, setUser] = createStore();
  const [student, setStudent] = createStore();
  const [period, setPeriod] = createStore();
  const [accommodationWallet, setAccommodationWallet] = createSignal("");
  const [showSuccess, setShowSuccess] = createSignal(false);
  const [showSuccess2, setShowSuccess2] = createSignal(false);
  const [studentReg, setStudentReg] = createStore();
  const [application, setApplication] = createStore();
  const [hostelDet, setHostelDet] = createStore();
  const [appHostelStatus, setAppHostelStatus] = createSignal();
  const [hostels, setHostels] = createStore([]);
  const [numOfBeds, setNumOfBeds] = createStore([]);
  const [isProcessing, setIsProcessing] = createSignal();
  const [finished, setFinished] = createSignal(false);

  const hostelFormData = async () => {
    if (localStorage.getItem("jetsUser")) {
      const response = await fetch(
        VITE_API_URL +
          "/api/user/" +
          JSON.parse(localStorage.getItem("jetsUser")).custom_id,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        }
      );
      const result = await response.json();
      if (result.response === "Expired token") {
        localStorage.removeItem("jetsUser");
        navigate("/", { replace: true });
      } else {
        var registration = await fetchRegistration();

        const request4 = fetch(
          VITE_API_URL +
            "/api/hostel-application/" +
            params.periodId +
            "/" +
            params.customId,
          {
            mode: "cors",
            headers: {
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("jetsUser")).token
              }`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            method: "GET",
          }
        ).then((response) => response.json());

        const request0 = fetch(VITE_API_URL + "/api/user/" + params.customId, {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        }).then((response) => response.json());

        const request1 = fetch(
          VITE_API_URL + "/api/student/" + params.customId,
          {
            mode: "cors",
            headers: {
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("jetsUser")).token
              }`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            method: "GET",
          }
        ).then((response) => response.json());

        const request2 = fetch(
          VITE_API_URL + "/api/period/" + params.periodId,
          {
            mode: "cors",
            headers: {
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("jetsUser")).token
              }`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            method: "GET",
          }
        ).then((response) => response.json());

        const request3 = fetch(
          VITE_API_URL + "/api/accommodation-wallet/" + params.customId,
          {
            mode: "cors",
            headers: {
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("jetsUser")).token
              }`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            method: "GET",
          }
        ).then((response) => response.json());

        const request5 = fetch(VITE_API_URL + "/api/view-hostels", {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        }).then((response) => response.json());

        Promise.all([
          request0,
          request1,
          request2,
          request3,
          request4,
          request5,
        ])
          .then(([data0, data1, data2, data3, data4, data5]) => {
            if (data4.response.status === "complete") {
              setFinished(true);
            } else {
              setAccommodationWallet(data3.response.amount);
              setStudent(data1.response);
              setApplication(data4.response);
              getHostel(data4.response.hostel_id);
              setStudentReg(registration);
              setPeriod(data2.response);
              setUser(data0.response);
              setHostels(data5.response);
              getBedsCount(data5.response);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
      return {
        student,
        studentReg,
        period,
        application,
        user,
        accommodationWallet,
        hostels,
      };
    } else {
      navigate("/", { replace: true });
    }
  };

  const c = {};
  var countBeds = 0;
  const getBedsCount = async (arr) => {
    for (let i = 0; i < arr.length; i++) {
      try {
        const res = await fetch(
          VITE_API_URL + "/api/view-all-beds/" + arr[i].id,
          {
            mode: "cors",
            headers: {
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("jetsUser")).token
              }`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            method: "GET",
          }
        );
        const result = await res.json();
        if (result.response.length > 0) {
          var allBeds = result.response;
          for (let i = 0; i < allBeds.length; i++) {
            if (allBeds[i].status === "opened") {
              countBeds = countBeds + 1;
            }
          }
        } else {
          countBeds = result.response.length;
        }
        c[arr[i].id] = countBeds;
      } catch (error) {
        console.error(error);
      }
    }
    setNumOfBeds(c);
  };

  const fetchRegistration = async () => {
    try {
      const response = await fetch(
        VITE_API_URL +
          "/api/registration/" +
          params.customId +
          "?period_id=" +
          params.periodId,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        }
      );

      const result = await response.json();
      if (result.response) {
        return result.response;
      } else {
        if (JSON.parse(localStorage.getItem("jetsUser")).role === "admin") {
          navigate("/admin/semester-registration", { replace: true });
        } else {
          navigate("/student/semester-registration", { replace: true });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getHostel = async (id) => {
    try {
      const response = await fetch(VITE_API_URL + "/api/hostel/" + id, {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("jetsUser")).token
          }`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "GET",
      });

      const result = await response.json();
      setHostelDet(result.response);
    } catch (error) {
      console.error(error);
    }
  };

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  const getOptPassport = (val) => {
    if (val) {
      var pass1 = val.substring(0, 49);
      var pass2 = val.substring(48);
      var passport = pass1 + "c_scale,w_500/f_auto" + pass2;
      return passport;
    } else {
      return "wait";
    }
  };

  const doApply = async (id, name) => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        VITE_API_URL + "/api/edit-hostel-application/" + params.customId,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "PATCH",
          body: JSON.stringify({
            hostel_id: id,
            hostel_name: name,
            period_id: params.periodId,
            status: "awaiting porter",
          }),
        }
      );

      const result = await response.json();

      setIsProcessing(false);
      window.location.href =
        "/student/hostel-form/" + params.periodId + "/" + params.customId;
    } catch (error) {
      console.error(error);
    }
  };

  const [hostelAllocationPopup, setHostelAllocationPopup] = createSignal(false);
  const [rooms, setRooms] = createSignal();
  const [beds, setBeds] = createSignal();
  const [openingBal, setOpeningBal] = createSignal();
  const [closingBal, setClosingBal] = createSignal();
  const showHostelAllocationForm = async (
    hostel_id,
    acc_wallet,
    total_charges
  ) => {
    setHostelAllocationPopup(true);
    setOpeningBal(acc_wallet);
    setClosingBal(parseInt(acc_wallet) - parseInt(total_charges));
    try {
      const response = await fetch(
        VITE_API_URL + "/api/view-rooms/" + hostel_id,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        }
      );

      const result = await response.json();
      var allRooms = result.response;
      var opened_rooms = allRooms.filter((room) => room.status == "opened");

      var roomsArr = [];
      for (let i = 0; i < opened_rooms.length; i++) {
        var r = {
          value: opened_rooms[i].room_number,
          label: "Room " + opened_rooms[i].room_number,
        };
        roomsArr.push(r);
        getBeds(hostel_id, opened_rooms[i].id, opened_rooms[i].room_number);
      }
      setRooms(roomsArr);
    } catch (error) {
      console.error(error);
    }
  };

  const b = {};
  var bedsArr = [];
  const getBeds = async (hostel_id, room_id, room_number) => {
    try {
      const res = await fetch(
        VITE_API_URL + "/api/view-beds/" + hostel_id + "/" + room_id,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        }
      );
      const result = await res.json();

      var allBeds = result.response;
      var opened_beds = allBeds.filter((bed) => bed.status == "opened");
      for (let i = 0; i < opened_beds.length; i++) {
        var r = {
          value: opened_beds[i].bed_number,
          label: "Bedspace " + opened_beds[i].bed_number,
        };
        bedsArr.push(r);
      }
      b[room_number] = bedsArr;
    } catch (error) {
      console.error(error);
    }
    setBeds(b);
  };

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      const request1 = fetch(
        VITE_API_URL + "/api/edit-accommodation-wallet/" + params.customId,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "PATCH",
          body: JSON.stringify({
            amount: closingBal(),
          }),
        }
      ).then((response) => response.json());
      const request2 = fetch(
        VITE_API_URL + "/api/edit-hostel-application/" + params.customId,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "PATCH",
          body: JSON.stringify({
            period_id: params.periodId,
            room_number: formData().rooms,
            bed_number: formData().beds,
            form_number: "HA" + params.periodId.slice(-2) + params.customId,
            opening_balance: openingBal(),
            closing_balance: closingBal(),
            allocation_date: new Date().toLocaleDateString(),
            status: "complete",
            hostel_cost: parseInt(openingBal()) - parseInt(closingBal()),
          }),
        }
      ).then((response) => response.json());

      Promise.all([request1, request2]).then(async ([data1, data2]) => {
        // sendSMS();

        // if (props.phone.length > 10) {
        //   var phone = "+234" + props.phone.substring(1, 11);
        // } else {
        //   var phone = "+234" + props.phone;
        // }
        // var msg =
        //   "Bursar has approved your registration. Login to the portal to complete the process.";
        // const res = await axios.post("https://api.ng.termii.com/api/sms/send", {
        //   api_key:
        //     "TLWK68ATIe2skreBC99fl2dy7ltYNjpqpJweEoRqLRCPOamqO54zIP4RmGVh5P",
        //   to: phone,
        //   from: "JETS",
        //   sms: msg,
        //   type: "plain",
        //   channel: "generic",
        // });
        setIsProcessing(false);
        setHostelAllocationPopup(false);
        setShowSuccess2(true);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const [insufficientFunds, setInsufficientFunds] = createSignal(false);
  const ApplyForHostel = async (hostelId, amount) => {
    if (parseInt(accommodationWallet()) <= parseInt(amount) + 2000) {
      try {
        const response = await fetch(
          VITE_API_URL + "/api/create-hostel-application",
          {
            mode: "cors",
            headers: {
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("jetsUser")).token
              }`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              custom_id: formData().custom_id,
              period_id: formData().period_id,
              hostel_name: formData().hostel_name,
              status: "started",
            }),
          }
        );

        const result = await response.json();

        if (!result.success) {
          setMessage(result.response);
          setIsProcessing(false);
        } else {
          setIsProcessing(false);
          setShowSuccess(true);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setInsufficientFunds(true);
    }
  };

  const params = useParams();

  const [hostelData] = createResource(hostelFormData);
  return (
    <MetaProvider>
      <Title>Hostel Request Form - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Hostel Request Form on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Show when={finished()}>
          <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Hostel Accommodation Secured
              </h2>
              <div class="my-2 border-t border-b py-4 border-black space-y-4">
                <img
                  src="/happy.gif"
                  class="w-40 mx-auto p-3 border-4 border-green-600 rounded-full"
                />
                <p>
                  Congratulations! Your hostel accommodation request for the
                  chosen semester is COMPLETE! Click the link below to download
                  and print your proof of hostel allocation:
                </p>
                <p class="text-center py-6">
                  <A
                    href="/student/print-outs"
                    class="hover:opacity-60 p-3 green-btn"
                  >
                    Go to Print
                  </A>
                </p>
                <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
                  <p>
                    <b>NOTE:</b>
                    <br />
                    Always print a copy of your proof of hostel allocation and
                    KEEP it. You will need them during your graduation
                    clearance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Show>

        <Show when={showSuccess()}>
          <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Application Submitted
              </h2>
              <div class="my-2 border-t border-b py-4 border-black text-center">
                <Success />
                <p>
                  Your application for hostel accommodation was submitted
                  successfully!
                </p>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() =>
                    (window.location.href =
                      "/student/hostel-form/" +
                      params.periodId +
                      "/" +
                      params.customId)
                  }
                  class="blue-btn text-white p-3 hover:opacity-60"
                >
                  Ok. Continue
                </button>
              </div>
            </div>
          </div>
        </Show>
        <Show when={showSuccess2()}>
          <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Hostel Allocation Success
              </h2>
              <div class="my-2 border-t border-b py-4 border-black text-center">
                <Success />
                <p>Hostel was allocated successfully!</p>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() =>
                    (window.location.href =
                      "/admin/hostel-applications/" + params.periodId)
                  }
                  class="blue-btn text-white p-3 hover:opacity-60"
                >
                  Ok. Continue
                </button>
              </div>
            </div>
          </div>
        </Show>
        <Show when={notRegistered()}>
          <div class="fixed z-50 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Not Registered
              </h2>

              <div class="my-2 border-t border-b py-4 border-black space-y-4">
                <img
                  src="/alarm.gif"
                  class="w-40 mx-auto p-3 border-4 border-red-600 rounded-full"
                />

                <p>
                  You are NOT REGISTERED for the chosen semester hence NOT
                  ALLOWED to Hostel Request Form accommodation.
                </p>
                <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
                  <p>
                    <b>NOTE:</b>
                    <br />
                    If you are seeing this despite completing your semester
                    registration (i.e. you have your PRINT OUT) please contact
                    the ICT department.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Show>
        <Show when={insufficientFunds()}>
          <div class="fixed z-50 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Insufficient Funds
              </h2>

              <div class="my-2 border-t border-b py-4 border-black space-y-4">
                <img
                  src="/alarm.gif"
                  class="w-40 mx-auto p-3 border-4 border-red-600 rounded-full"
                />

                <p class="text-center">
                  Your Accommodation Wallet Balance is Insufficient for the
                  Hostel you wish to apply for.
                </p>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() =>
                    (window.location.href =
                      "/student/hostel-form/" +
                      params.periodId +
                      "/" +
                      params.customId)
                  }
                  class="blue-btn text-white p-3 hover:opacity-60"
                >
                  Return
                </button>
              </div>
            </div>
          </div>
        </Show>
        <Show when={hostelAllocationPopup()}>
          <div class="fixed z-50 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Allocate Bunk: {hostelData().application.hostel_name}
              </h2>
              <div class="my-2 border-t border-b py-4 border-black space-y-4">
                <form
                  autocomplete="off"
                  onSubmit={submit}
                  class="grid lg:grid-cols-2 gap-4"
                >
                  <div>
                    <Select
                      label="Available Rooms:"
                      name="rooms"
                      placeholder="Select"
                      required={true}
                      options={rooms()}
                      formHandler={formHandler}
                    />
                  </div>
                  <div>
                    <Show
                      when={formData().rooms && beds()[formData().rooms]}
                      fallback={
                        <Select
                          label="Available Beds/bunks:"
                          name="beds"
                          placeholder="Select"
                          required={true}
                          options=""
                          formHandler={formHandler}
                        />
                      }
                    >
                      <Select
                        label="Available Beds/bunks:"
                        name="beds"
                        placeholder="Select"
                        required={true}
                        options={beds()[formData().rooms]}
                        formHandler={formHandler}
                      />
                    </Show>
                  </div>
                  <div class="lg:col-span-2 text-right space-x-3">
                    <Show
                      when={formHandler.isFormInvalid()}
                      fallback={
                        <>
                          <Show
                            when={isProcessing()}
                            fallback={
                              <button
                                type="submit"
                                class="red-btn p-3 hover:opacity-60"
                              >
                                Submit
                              </button>
                            }
                          >
                            <button disabled class="gray2-btn cursor-wait p-3">
                              Processing.. .
                            </button>
                          </Show>
                        </>
                      }
                    >
                      <button disabled class="gray-btn p-3 cursor-not-allowed">
                        Submit
                      </button>
                    </Show>
                    <button
                      onClick={() => setHostelAllocationPopup(false)}
                      class="gray-btn text-white p-3 hover:opacity-60"
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Show>

        <Header />
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Hostel Request Form
          </h2>
          <Show
            when={
              !hostelData.loading &&
              JSON.parse(localStorage.getItem("jetsUser")).role === "student"
            }
          >
            <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
              <Switch>
                <Match
                  when={hostelData().application.status === "awaiting bursar"}
                >
                  <b class="block">
                    Application Status:{" "}
                    <u class="text-red-700 font-semibold">
                      Awaiting Accommodation Wallet Update
                    </u>
                  </b>
                  <b class="text-blue-900">Note:</b>
                  <br />
                  You have started your hostel accommodation application. Please
                  wait for a little while for your accommodation wallet to be
                  updated.
                </Match>
                <Match when={hostelData().application.status === "disapproved"}>
                  <b class="block">
                    Application Status:{" "}
                    <u class="text-red-700 font-semibold">Rejected</u>
                  </b>
                  <b class="text-blue-900">Note:</b>
                  <br />
                  Your hostel accommodation request was REJECTED by the porter
                  <br />
                  <b class="text-blue-900">Reason(s):</b>
                  <br />
                  <p class="bg-black border-l-8 border-red-600 text-white rounded p-2">
                    {hostelData().application.comment}
                  </p>
                </Match>
                <Match
                  when={hostelData().application.status === "balance updated"}
                >
                  <b class="block">
                    Application Status:{" "}
                    <u class="text-red-700 font-semibold">
                      Incomplete Request for Hostel
                    </u>
                  </b>
                  <b class="text-blue-900">Note:</b>
                  <br />
                  Your accommodation wallet is updated please complete your
                  request by selecting any of the available hostels.
                </Match>
                <Match
                  when={hostelData().application.status === "awaiting porter"}
                >
                  <b class="block">
                    Application Status:{" "}
                    <u class="text-red-700 font-semibold">Awaiting Porter</u>
                  </b>
                  <b class="text-blue-900">Note:</b>
                  <br />
                  Your hostel request is awaiting the Porter who will allocate a
                  room and bedspace/bunk to you soon.
                </Match>
              </Switch>
            </div>
          </Show>
          <div class="border border-gray-600 shadow-md rounded p-2 lg:p-4">
            <Show
              when={hostelData.loading}
              fallback={
                <div class="space-y-6">
                  <div class="overflow-x-auto">
                    <table cellPadding={0} cellSpacing={0} class="w-full">
                      <thead>
                        <tr class="bg-white border-b border-black text-blue-900">
                          <th class="p-1 text-left uppercase" colSpan={5}>
                            :: Personal Data
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr class="border-b border-black">
                          <td class="p-4">
                            <b>Year of Admission:</b>&nbsp;
                            <span>
                              {hostelData().student.year_of_admission}
                            </span>
                          </td>
                          <td class="p-4">
                            <b>Today's Date:</b>&nbsp;
                            <span>
                              {new Date().getDate()}-{new Date().getMonth() + 1}
                              -{new Date().getFullYear()}
                            </span>
                          </td>
                          <td class="p-4">
                            <b>Academic Session:</b>&nbsp;
                            <span>{hostelData().period.session}</span>
                          </td>
                          <td class="p-4">
                            <b>Semester(s):</b>&nbsp;
                            <span class="uppercase">
                              {hostelData().period.semester}
                            </span>
                          </td>
                          <td class="p-4" rowSpan={4}>
                            <div class="w-40 max-h-40 overflow-hidden rounded-md">
                              <img
                                src={getOptPassport(
                                  hostelData().user.passport_url
                                )}
                                class="w-full"
                              />
                            </div>
                          </td>
                        </tr>
                        <tr class="border-b border-black">
                          <td class="p-4">
                            <b>Name:</b>&nbsp;
                            <b class="uppercase">
                              {hostelData().user.surname}
                            </b>{" "}
                            <span>{hostelData().user.first_name}</span>{" "}
                            <span>{hostelData().user.other_names}</span>
                          </td>
                          <td class="p-4">
                            <b>Gender:</b>&nbsp;
                            <span class="uppercase">
                              {hostelData().user.gender}
                            </span>
                          </td>
                          <td class="p-4">
                            <b>Phone Number:</b>&nbsp;
                            <span>{hostelData().user.phone_number}</span>
                          </td>
                          <td class="p-4">
                            <b>Email:</b>&nbsp;
                            <span>{hostelData().student.email}</span>
                          </td>
                        </tr>
                        <tr class="border-b border-black">
                          <td class="p-4">
                            <b>Ledger No.:</b>&nbsp;
                            {hostelData().student.ledger_number}
                          </td>
                          <td class="p-4">
                            <b>Mat. No.:</b>&nbsp;
                            <span class="uppercase">
                              {hostelData().student.matriculation_number}
                            </span>
                          </td>
                          <td class="p-4">
                            <b>Special St. Cat:</b>&nbsp;
                            <span class="capitalize">
                              {hostelData().student.special_student_category}
                            </span>
                          </td>
                          <td class="p-4">
                            <b>Denomination:</b>&nbsp;
                            <span>{hostelData().student.denomination}</span>
                          </td>
                        </tr>
                        <tr class="border-b border-black">
                          <td class="p-4" colSpan={2}>
                            <b>Programme:</b>&nbsp;
                            {hostelData().student.programme}
                          </td>
                          <td class="p-4">
                            <b>Affiliation Status:</b>&nbsp;
                            <span class="uppercase">
                              {hostelData().student.affiliation_status}
                            </span>
                          </td>
                          <td class="p-4">
                            <b>Current Level:</b>&nbsp;
                            <span>
                              {hostelData().studentReg.current_level}
                              &nbsp;
                              <span class="uppercase">
                                ({hostelData().studentReg.fresh_returning}{" "}
                                Student)
                              </span>
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <Show
                    when={
                      JSON.parse(localStorage.getItem("jetsUser")).role ===
                      "student"
                    }
                  >
                    <Show
                      when={
                        hostelData().application.status === "balance updated" ||
                        hostelData().application.status === "disapproved"
                      }
                    >
                      <div class="overflow-x-auto">
                        <table cellPadding={0} cellSpacing={0} class="w-full">
                          <thead>
                            <tr class="bg-white border-b border-black text-blue-900">
                              <th class="p-1 text-left uppercase" colSpan={5}>
                                :: Hostels
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr class="border-b border-black">
                              <td class="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <For each={hostelData().hostels}>
                                  {(hostel, i) => (
                                    <div class="bg-blue-50 border-2 border-blue-950 p-1 pb-2 rounded-lg text-center">
                                      <h2 class="font-semibold leading-tight text-lg text-blue-900">
                                        {hostel.hostel_name}
                                      </h2>
                                      <div class="mt-1">
                                        <span class="text-gray-600">Cost:</span>{" "}
                                        {formatter.format(
                                          hostelData().period.season.toLowerCase() ===
                                            "summer"
                                            ? parseInt(hostel.amount_per_summer)
                                            : parseInt(
                                                hostel.amount_per_semester
                                              )
                                        )}
                                      </div>
                                      <div>
                                        <span class="text-gray-600">
                                          Caution Fee:
                                        </span>{" "}
                                        {formatter.format(hostel.caution)}
                                      </div>
                                      <div>
                                        <span class="text-gray-600">
                                          Available Rooms:
                                        </span>{" "}
                                        {numOfBeds[hostel.id]}
                                      </div>
                                      <Show
                                        when={
                                          hostelData().application.status ===
                                            "balance updated" ||
                                          hostelData().application.status ===
                                            "disapproved"
                                        }
                                      >
                                        <div class="mt-4 mb-2">
                                          <Show
                                            when={hostel.status === "opened"}
                                            fallback={
                                              <span class="gray-btn rounded-lg text-white p-2.5 opacity-60 cursor-not-allowed">
                                                Hostel is Closed
                                              </span>
                                            }
                                          >
                                            <Show
                                              when={hostelData().accommodationWallet()}
                                              fallback={
                                                <span class="bg-orange-600 rounded-lg text-white p-3 text-xs font-bold">
                                                  Contact ICT Department
                                                </span>
                                              }
                                            >
                                              {parseInt(
                                                hostelData().accommodationWallet()
                                              ) >=
                                              parseInt(
                                                hostelData().period.season.toLowerCase() ===
                                                  "summer"
                                                  ? parseInt(
                                                      hostel.amount_per_summer
                                                    )
                                                  : parseInt(
                                                      hostel.amount_per_semester
                                                    )
                                              ) ? (
                                                <span
                                                  onClick={() => {
                                                    doApply(
                                                      hostel.id,
                                                      hostel.hostel_name
                                                    );
                                                  }}
                                                  class="blue-btn rounded-lg text-white p-2.5 hover:opacity-60 cursor-pointer"
                                                >
                                                  Request this hostel
                                                </span>
                                              ) : (
                                                <span class="gray2-btn rounded-lg text-white p-2.5 cursor-not-allowed">
                                                  Open but Insufficient Bal.
                                                </span>
                                              )}
                                            </Show>
                                          </Show>
                                        </div>
                                      </Show>
                                    </div>
                                  )}
                                </For>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Show>
                  </Show>
                  <Show
                    when={hostelData().application.status === "awaiting porter"}
                  >
                    <div class="overflow-x-auto">
                      <table cellPadding={0} cellSpacing={0} class="w-full">
                        <thead>
                          <tr class="bg-white border-b border-black text-blue-900">
                            <th class="p-1 text-left uppercase" colSpan={5}>
                              :: Hostel Accommodation
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="border-b border-black">
                            <td class="p-4">
                              Hostel:
                              <br />
                              <b>{hostelData().application.hostel_name}</b>
                            </td>
                            <td class="p-4">
                              Room Allocated:
                              <br />
                              <b>
                                {hostelData().application.room_number
                                  ? hostelData().application.room_number
                                  : "None Yet"}
                              </b>
                            </td>
                            <td class="p-4">
                              Bedspace/Bunk Allocated:
                              <br />
                              <b>
                                {hostelData().application.bed_number
                                  ? hostelData().application.bed_number
                                  : "None Yet"}
                              </b>
                            </td>
                            <td class="p-4">
                              Date Allocated:
                              <br />
                              <b>
                                {hostelData().application.allocation_date
                                  ? hostelData().application.allocation_date
                                  : "None Yet"}
                              </b>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div class="overflow-x-auto">
                      <table cellPadding={0} cellSpacing={0} class="w-full">
                        <thead>
                          <tr class="bg-white border-b border-black text-blue-900">
                            <th class="p-1 text-left uppercase">
                              :: SUMMARY OF FEES
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="border-b border-black">
                            <td class="p-4">
                              <span class="flex space-x-4 lg:space-x-0 lg:justify-between">
                                <span>
                                  Accommodation Wallet:{" "}
                                  <b>
                                    {formatter.format(
                                      hostelData().accommodationWallet()
                                    )}
                                  </b>
                                </span>
                                <span>
                                  Caution Fee:{" "}
                                  <b>{formatter.format(hostelDet.caution)}</b>
                                </span>
                                <span>
                                  Cost of Hostel:{" "}
                                  <Show when={hostelData().period.season}>
                                    <b>
                                      {hostelData().period.season.toLowerCase() ===
                                      "summer"
                                        ? formatter.format(
                                            parseInt(
                                              hostelDet.amount_per_summer
                                            )
                                          )
                                        : formatter.format(
                                            parseInt(
                                              hostelDet.amount_per_semester
                                            )
                                          )}
                                    </b>
                                  </Show>
                                </span>
                                <span class="">
                                  Total Charges:{" "}
                                  <Show when={hostelData().period.season}>
                                    <b>
                                      {hostelData().period.season.toLowerCase() ===
                                      "summer"
                                        ? formatter.format(
                                            parseInt(hostelDet.caution) +
                                              parseInt(
                                                hostelDet.amount_per_summer
                                              )
                                          )
                                        : formatter.format(
                                            parseInt(hostelDet.caution) +
                                              parseInt(
                                                hostelDet.amount_per_semester
                                              )
                                          )}
                                    </b>
                                  </Show>
                                </span>
                                <span>
                                  Amount to Add:{" "}
                                  <Show when={hostelData().period.season}>
                                    <b>
                                      <Show
                                        when={
                                          hostelData().accommodationWallet() >=
                                          (hostelData().period.season.toLowerCase() ===
                                          "summer"
                                            ? parseInt(hostelDet.caution) +
                                              parseInt(
                                                hostelDet.amount_per_summer
                                              )
                                            : parseInt(hostelDet.caution) +
                                              parseInt(
                                                hostelDet.amount_per_semester
                                              ))
                                        }
                                        fallback={
                                          <span>
                                            {formatter.format(
                                              (hostelData().period.season.toLowerCase() ===
                                              "summer"
                                                ? parseInt(hostelDet.caution) +
                                                  parseInt(
                                                    hostelDet.amount_per_summer
                                                  )
                                                : parseInt(hostelDet.caution) +
                                                  parseInt(
                                                    hostelDet.amount_per_semester
                                                  )) -
                                                parseInt(
                                                  hostelData().accommodationWallet()
                                                )
                                            )}
                                          </span>
                                        }
                                      >
                                        {formatter.format(0)}
                                      </Show>
                                    </b>
                                  </Show>
                                </span>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Show>

                  <Show
                    when={
                      JSON.parse(localStorage.getItem("jetsUser")).role ===
                      "admin"
                    }
                  >
                    <div class="overflow-x-auto">
                      <table cellPadding={0} cellSpacing={0} class="w-full">
                        <thead>
                          <tr class="bg-white border-b border-black text-blue-900">
                            <th class="p-1 text-left uppercase" colSpan={6}>
                              :: PROCESS FORM
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="border-b border-black">
                            <td class="p-4 border-r border-black w-1/6 sm:w-36 space-y-4 sm:space-y-0 sm:space-x-2">
                              <a
                                href={
                                  "tel:+234" + hostelData().user.phone_number
                                }
                                class="green-btn p-3 inline-block w-full sm:w-auto hover:opacity-60"
                              >
                                Call
                              </a>
                              <button
                                onClick={() => setShowSendSMS(true)}
                                class="green-btn p-3 w-full sm:w-auto hover:opacity-60"
                              >
                                SMS
                              </button>
                            </td>
                            <td class="p-4">
                              <Show
                                when={
                                  JSON.parse(localStorage.getItem("jetsUser"))
                                    .surname === "ict" ||
                                  JSON.parse(localStorage.getItem("jetsUser"))
                                    .surname === "porter"
                                }
                              >
                                <div
                                  class="flex flex-col space-y-4 md:space-y-0 
                                md:flex-row md:space-x-4"
                                >
                                  <div class="grow">
                                    <PorterRejectionForm
                                      customId={params.customId}
                                      periodId={params.periodId}
                                    />
                                  </div>
                                  <div class="pt-5">
                                    <button
                                      onClick={() => {
                                        showHostelAllocationForm(
                                          hostelData().application.hostel_id,
                                          hostelData().accommodationWallet(),
                                          hostelData().period.season.toLowerCase() ===
                                            "summer"
                                            ? parseInt(hostelDet.caution) +
                                                parseInt(
                                                  hostelDet.amount_per_summer
                                                )
                                            : parseInt(hostelDet.caution) +
                                                parseInt(
                                                  hostelDet.amount_per_semester
                                                )
                                        );
                                      }}
                                      class="w-full blue-btn text-white p-3 hover:opacity-60 cursor-pointer"
                                    >
                                      Allocate Bunk
                                    </button>
                                  </div>
                                </div>
                              </Show>
                              <Show
                                when={
                                  JSON.parse(localStorage.getItem("jetsUser"))
                                    .surname === "ict" ||
                                  JSON.parse(localStorage.getItem("jetsUser"))
                                    .surname === "bursar"
                                }
                              >
                                <BursarHostelConfirmationForm
                                  customId={params.customId}
                                  periodId={params.periodId}
                                  phone={hostelData().user.phone_number}
                                  currentBal={accommodationWallet()}
                                />
                              </Show>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2}>
                              *Call works only when using a mobile device.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Show>
                </div>
              }
            >
              <Loading />
            </Show>
          </div>
          <div>&nbsp;</div>
        </div>
      </div>
    </MetaProvider>
  );
}
