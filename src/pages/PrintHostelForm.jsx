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
            if (data4.response.status !== "complete") {
              console.log("redirect to app form");
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

  const params = useParams();

  const [hostelData] = createResource(hostelFormData);

  const printNow = async () => {
    if (JSON.parse(localStorage.getItem("jetsUser")).surname === "porter") {
      var theData = {
        period_id: params.periodId,
        print_porter: "yes",
      };
    }
    if (JSON.parse(localStorage.getItem("jetsUser")).surname === "bursar") {
      var theData = {
        period_id: params.periodId,
        print_bursar: "yes",
      };
    }

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
          body: JSON.stringify(theData),
        }
      );
      const result = await response.json();

      window.print();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <MetaProvider>
      <Title>Hostel Request Form - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Hostel Request Form on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <div class="full mx-auto space-y-4">
          <div class="">
            <Show
              when={hostelData.loading}
              fallback={
                <>
                  <div
                    onClick={() => printNow()}
                    class="no-print bg-purple-900 text-white text-lg text-center py-4 cursor-pointer hover:opacity-60"
                  >
                    Click here to Print
                  </div>
                  <h2 class="flex text-center pb-2 px-4 border-b border-red-200">
                    <div class="w-14">
                      <img src="/small-logo.png" class="w-full" />
                    </div>
                    <div class="grow text-center font-semibold pt-2">
                      <h1 class="text-xl">
                        ECWA Theological Seminary, KAGORO (ETSK)
                      </h1>
                      <p>Proof of Hostel Allocation</p>
                    </div>
                    <div class="pt-3 italics">
                      <b>Form No.: </b>
                      <br />
                      <Show when={hostelData().application.form_number}>
                        {hostelData().application.form_number}
                      </Show>
                    </div>
                  </h2>
                  <div class="space-y-6 px-4">
                    <div class="">
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
                                {new Date().getDate()}-
                                {new Date().getMonth() + 1}-
                                {new Date().getFullYear()}
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
                    <div class="">
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
                    <div class="">
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
                              <span class="flex justify-between">
                                <span>
                                  Opening Bal. Before Allocation:
                                  <br />
                                  <b>
                                    {formatter.format(
                                      hostelData().application.opening_balance
                                    )}
                                  </b>
                                </span>
                                <span>
                                  Caution Fee:
                                  <br />
                                  <b>{formatter.format(hostelDet.caution)}</b>
                                </span>
                                <span>
                                  Cost of Hostel:
                                  <br />
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
                                  Closing Bal. After Allocation:
                                  <br />
                                  <b>
                                    {formatter.format(
                                      hostelData().application.closing_balance
                                    )}
                                  </b>
                                </span>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div class="">
                      <table cellPadding={0} cellSpacing={0} class="w-full">
                        <tbody>
                          <tr class="border-b border-black">
                            <td class="p-4 flex justify-between text-center">
                              <div>
                                [1] <b>Sign:</b> ........................{" "}
                                <b>Date:</b> ........................
                                <br />
                                Porter
                              </div>
                              <div>
                                <img
                                  class="mx-auto"
                                  src={
                                    "https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=" +
                                    (
                                      <b>
                                        {hostelData().application.form_number}
                                      </b>
                                    )
                                  }
                                />
                                {/* QRCode from: https://goqr.me/api/ */}
                                <span class="text-xs text-right">QRHOSTEL</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
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
