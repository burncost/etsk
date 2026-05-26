import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { Match, Show, Switch, createResource, createSignal } from "solid-js";

import Header from "../components/Header";
import { Select } from "../components/Select";
import Loading from "../components/Loading";

const schema = z.object({
  fresh_returning: z.string().min(1, "*Required"),
  affiliation_fee: z.string().optional(),
  current_level: z.string().min(1, "*Required"),
});

export default function SemesterRegistrationPeriod() {
  const navigate = useNavigate();
  const VITE_API_URL = import.meta.env["VITE_API_URL"];
  const [showModal, setShowModal] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [periodId, setPeriodId] = createSignal("");
  const [programme, setProgramme] = createSignal("");
  const [affiliation_status, setAffiliationStatus] = createSignal("");
  const [programmeCategory, setProgrammeCategory] = createSignal("");
  const [underPost, setUnderPost] = createSignal("");
  const [department, setDepartment] = createSignal("");
  const [modeOfStudy, setModeOfStudy] = createSignal("");

  const [onlineStudents, setOnlineStudents] = createSignal(new Set([""]));

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  const fetchPeriods = async () => {
    const navigate = useNavigate();

    if (
      localStorage.getItem("jetsUser") &&
      JSON.parse(localStorage.getItem("jetsUser")).role === "student"
    ) {
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

      setModeOfStudy(result.response.mode_of_study)

      // check if student is in list to be exempted from registration restriction     
      const exists = onlineStudents().has(result.response.username);
            
      if (result.response === "Expired token") {
        localStorage.removeItem("jetsUser");
        navigate("/", { replace: true });
      } else if (result.response.status === "change password") {
        navigate("/student/change-default-password", { replace: true });
      } else if (result.response.status === "upload passport") {
        navigate("/student/passport", { replace: true });
      } else if (result.response.status === "complete profile") {
        navigate("/student/complete-profile", { replace: true });
      } else {
        try {
          const res = await fetch(VITE_API_URL + "/api/view-periods", {
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
          const result = await res.json();  
          // console.log("mode of study: ", modeOfStudy())        
          
          if (modeOfStudy() === "virtual" || modeOfStudy() === "weekend") {
            //find and change returned period to open
            const item = result.response.find(item => item.period_id === item.period_id);
            item.registration_status = "opened";
            // console.log("updated",result.response)
            return result.response;
          }
          return result.response;       
          
        } catch (error) {
          console.error(error);
          return []
        }
      }
    } else {
      navigate("/", { replace: true });
      return []
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    fetch(
      VITE_API_URL +
        "/api/student/" +
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
    )
      .then((response) => {
        return response.json();
      })
      .then(async (data0) => {
        setDepartment(data0.response.department);
        return fetch(VITE_API_URL + "/api/charge/" + underPost(), {
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
      })
      .then((response) => {
        return response.json();
      })
      .then(async (data1) => {
        var charges = JSON.parse(data1.response[formData().fresh_returning]);

        // if (
        //   department() === "Pastoral Studies" &&
        //   underPost() === "undergraduate"
        // ) {
        //   var dcharge = 3000; //change this
        //   // var dcharge = 0; //revert to above for summer and regular semeters
        // } else 
        //   if (underPost() === "postgraduate"){
        //     var dcharge = 2000; // charge updated for masters student
        //   }
        //   else
        //   if (underPost()==="postgraduate_online"){
        //     var dcharge = 2000
        //   }
        // else {
        //   var dcharge = 1000; //change this
        //   // var dcharge = 0; //revert to above for summer and regular semeters
        // }

        var admin_charges = Object.keys(charges); //gets keys for all seminary charges
        // console.log(Object.values(charges))
        var chargesObj = {};

        var total = 0;
        admin_charges.forEach((admin_charge) => {
          chargesObj[admin_charge] = [charges[admin_charge]];
          total = total + parseInt(charges[admin_charge]);
        });
        // total = total + parseInt(dcharge);
        total = total

        // chargesObj["Departmental Charges"] = [dcharge];
        chargesObj["total"] = [total];

        return fetch(VITE_API_URL + "/api/create-registration", {
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
            period_id: periodId(),
            custom_id: JSON.parse(localStorage.getItem("jetsUser")).custom_id,
            fresh_returning:
              formData().fresh_returning === "new_student"
                ? "new"
                : "returning",
            current_level: formData().current_level,
            registration_status: "started",
            seminary_charges: JSON.stringify(chargesObj),
          }),
        });
      })
      .then((response) => {
        return response.json();
      })
      .then((data2) => {
        if (data2.success) {
          navigate(
            "/student/registration-form/" +
              periodId() +
              "/" +
              JSON.parse(localStorage.getItem("jetsUser")).custom_id
          );
        } else {
          setMessage("ERROR. Contact ICT Dept.");
          setIsProcessing(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const startContinueReg = async (period_id) => {
    const custom_id = JSON.parse(localStorage.getItem("jetsUser")).custom_id;
    setIsProcessing(true);
    try {
      const response = await fetch(
        VITE_API_URL +
          "/api/registration/" +
          custom_id +
          "?period_id=" +
          period_id,
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
        setIsProcessing(false);
        navigate("/student/registration-form/" + period_id + "/" + custom_id);
      } else {
        const response = await fetch(
          VITE_API_URL + "/api/student/" + custom_id,
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
        const result2 = await response.json();
        
        const ma = result2.response.programme_category === "Masters Programme"
        const mdiv = result2.response.programme_category === "Master of Divinity Programme"
        const pgdt = result2.response.programme_category === "PGDT Programme"

        if (result2.response.department === null) {
          navigate("/student/confirm-details");
        } else
         {
          setAffiliationStatus(result2.response.affiliation_status);
          setProgramme(result2.response.programme);
          setProgrammeCategory(result2.response.programme_category);
          if (
            ma || mdiv || pgdt
          )
          {
            setUnderPost("postgraduate");
          }else
            {
            setUnderPost("undergraduate");
          } 
          setIsProcessing(false);
          setShowModal(true);
          setPeriodId(period_id);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [periods] = createResource(fetchPeriods);
  
  return (
    <MetaProvider>
      <Title>
        Semester Registration - ECWA Theological Seminary, KAGORO (ETSK)
      </Title>
      <Meta
        name="description"
        content="Semester Registration on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Show when={showModal()}>
          <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Start Registration
              </h2>

              <div class="my-2 border-t border-b py-4 border-black">
                <Show when={programme() !== "" && affiliation_status() !== ""}>
                  <form autocomplete="off" onSubmit={submit} class="space-y-4">
                    <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
                      <b class="block">Attention:</b>
                      <p>
                        Please make sure you answer these questions correctly.{" "}
                        <b>
                          Your answers will determine your semester registration
                          options
                        </b>
                        .
                      </p>
                    </div>
                    <div>
                      <Select
                        label={"Are you a New/Fresh Student?"}
                        name="fresh_returning"
                        placeholder="Select"
                        required={true}
                        options={[
                          {
                            value: "new_student",
                            label:
                              "YES. I am a NEW/FRESH Student of " + programme(),
                          },
                          {
                            value: "returning_student",
                            label:
                              "NO. I am a Returning Student of " + programme(),
                          },
                        ]}
                        formHandler={formHandler}
                      />
                    </div>
                    <div>
                      <Switch>
                        <Match
                          when={programmeCategory() === "Diploma Programme"}
                        >
                          <Select
                            label="Current Level:"
                            name="current_level"
                            placeholder="Select"
                            required={true}
                            options={[
                              {
                                value: "1-Diploma",
                                label: "Year 1 - Diploma",
                              },
                              {
                                value: "2-Diploma",
                                label: "Year 2 - Diploma",
                              },
                              {
                                value: "3-Diploma",
                                label: "Year 3 - Diploma",
                              },
                            ]}
                            formHandler={formHandler}
                          />
                        </Match>
                        <Match
                          when={
                            programmeCategory() === "Bachelor of Arts Programme"
                          }
                        >
                          <Select
                            label="Current Level:"
                            name="current_level"
                            placeholder="Select"
                            required={true}
                            options={[
                              {
                                value: "1-BA",
                                label: "Year 1 - Bachelor of Arts",
                              },
                              {
                                value: "2-BA",
                                label: "Year 2 - Bachelor of Arts",
                              },
                              {
                                value: "3-BA",
                                label: "Year 3 - Bachelor of Arts",
                              },
                              {
                                value: "4-BA",
                                label: "Year 4 - Bachelor of Arts",
                              },
                            ]}
                            formHandler={formHandler}
                          />
                        </Match>
                        <Match when={programmeCategory() === "PGDT Programme"}>
                          <Select
                            label="Current Level:"
                            name="current_level"
                            placeholder="Select"
                            required={true}
                            options={[
                              {
                                value: "5",
                                label: "PGDT",
                              },
                            ]}
                            formHandler={formHandler}
                          />
                        </Match>
                        <Match
                          when={programmeCategory() === "Masters Programme"}
                        >
                          <Select
                            label="Current Level:"
                            name="current_level"
                            placeholder="Select"
                            required={true}
                            options={[
                              {
                                value: "6",
                                label: "Year 1 - Master of Arts",
                              },
                              {
                                value: "7",
                                label: "Year 2 - Master of Arts",
                              },
                            ]}
                            formHandler={formHandler}
                          />
                        </Match>

                        <Match
                          when={
                            programmeCategory() ===
                            "Master of Divinity Programme"
                          }
                        >
                          <Select
                            label="Current Level:"
                            name="current_level"
                            placeholder="Select"
                            required={true}
                            options={[
                              {
                                value: "6",
                                label: "Year 1 - Master of Divinity",
                              },
                              {
                                value: "7",
                                label: "Year 2 - Master of Divinity",
                              },
                              {
                                value: "7",
                                label: "Year 3 - Master of Divinity",
                              },
                            ]}
                            formHandler={formHandler}
                          />
                        </Match>
                      </Switch>
                    </div>
                    <Show when={affiliation_status() === "yes"}>
                      <div>
                        <p><b><u>AFFILIATION FEE: {formatter.format("20000")}</u></b></p>
                        {/* <Select
                          label={
                            "How much do you wish to pay for affiliation this semester?"
                          }
                          name="affiliation_fee"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "0",
                              label: "0 Naira",
                            },
                          ]}
                          formHandler={formHandler}
                        /> */}
                      </div>
                    </Show>
                    <Show when={message() !== ""}>
                      <div class="bg-purple-200 text-purple-900 p-3 text-center animate-pulse border-l-2 border-black">
                        {message()}
                      </div>
                    </Show>
                    <div class="text-right space-x-3">
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
                              <button
                                disabled
                                class="gray2-btn cursor-wait p-3"
                              >
                                Processing.. .
                              </button>
                            </Show>
                          </>
                        }
                      >
                        <button
                          disabled
                          class="gray-btn p-3 cursor-not-allowed"
                        >
                          Submit
                        </button>
                      </Show>
                      <button
                        onClick={() => setShowModal(false)}
                        class="gray-btn text-white p-3 hover:opacity-60"
                      >
                        Close
                      </button>
                    </div>
                  </form>
                </Show>
              </div>
            </div>
          </div>
        </Show>
        <Header />
        <div class="mt-8 mb-20 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Semester Registration: Choose Period
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>
              Choose the appropriate semester(s) and session you wish to
              register for.
            </p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-2 lg:p-4 overflow-x-auto">
            <table
              cellPadding={0}
              cellSpacing={0}
              class="w-full my-4 border border-black"
            >
              <thead class="bg-blue-950 text-white border-b border-black">
                <tr>
                  <td class="p-4 border-r border-black">#.</td>
                  <td class="p-4 border-r border-black">Sem.</td>
                  <td class="p-4 border-r border-black">Session</td>
                  <td class="p-4 border-r border-black">Season</td>
                  <td class="p-4 border-r border-black">Status</td>
                  <td class="p-4">Register</td>
                </tr>
              </thead>
              <tbody>
                <Show
                  when={periods.loading}
                  fallback={
                    <Show                    
                      when={periods().length > 0}
                      fallback={
                        <tr>
                          <td colSpan={6} class="p-3 text-center">
                            No record found.
                          </td>
                        </tr>
                      }
                    >
                      <For each={periods()}>
                        {(period, i) => (
                          <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                            <td class="p-4 border-r border-black font-semibold">
                              {i() + 1}.
                            </td>
                            <td class="p-4 border-r border-black capitalize">
                              {period.semester}
                            </td>
                            <td class="p-4 border-r border-black">
                              {period.session}
                            </td>
                            <td class="p-4 border-r border-black capitalize">
                              {period.season}
                            </td>
                            <td class="p-4 border-r border-black capitalize font-semibold ">
                              {period.registration_status}
                            </td>
                            <td class="p-4">
                              <Show
                                when={period.registration_status === "closed"}
                                fallback={
                                  <Show
                                    when={isProcessing()}
                                    fallback={
                                      <button
                                        onClick={() =>
                                          startContinueReg(period.period_id)
                                        }
                                        class="red-btn p-3 border border-black text-center hover:opacity-60"
                                      >
                                        Start/Continue
                                      </button>
                                    }
                                  >
                                    <button
                                      disabled
                                      class="gray2-btn p-3 border border-black text-center cursor-not-allowed animate-pulse"
                                    >
                                      Processing.. .
                                    </button>
                                  </Show>
                                }
                              >
                                <button
                                  disabled
                                  class="gray-btn p-3 border border-black text-center cursor-not-allowed line-through"
                                >
                                  Start/Continue
                                </button>
                              </Show>
                            </td>
                          </tr>
                        )}
                      </For>
                    </Show>
                  }
                >
                  <tr>
                    <td colSpan={6} class="p-3 text-center">
                      <Loading />
                    </td>
                  </tr>
                </Show>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}
