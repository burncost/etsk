import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";

import Header from "../components/Header";
import Loading from "../components/Loading";

export default function ProfileStudent() {
  const VITE_API_URL = import.meta.env["VITE_API_URL"];
  const [loading, setLoading] = createSignal(true);
  const [user, setUser] = createSignal();
  const [student, setStudent] = createSignal();

  createEffect(async () => {
    const navigate = useNavigate();
    if (localStorage.getItem("jetsUser")) {
      fetch(
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
      )
        .then((response) => {
          return response.json();
        })
        .then((data1) => {
          if (data1.response === "Expired token") {
            localStorage.removeItem("jetsUser");
            navigate("/", { replace: true });
          }
          setUser(data1.response);
          return fetch(
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
          );
        })
        .then((response) => {
          return response.json();
        })
        .then((data2) => {
          setStudent(data2.response);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      navigate("/", { replace: true });
    }
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

  return (
    <MetaProvider>
      <Title>My Profile - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="My Profile on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <Show when={!loading()} fallback={<Loading />}>
          <div class="mt-8 mb-20 w-11/12 mx-auto space-y-4">
            <h2 class="text-lg font-semibold text-center border-b border-red-600">
              My Profile
            </h2>
            <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
              <b class="block">Instruction:</b>
              <p>
                Notice any errors or wrong entries? Please ensure you proceed to
                the ICT department and have it fixed immediately.
              </p>
            </div>
            <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4">
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
                <div class="col-span-2 sm:col-span-1 sm:row-span-3 text-center space-y-2">
                  <div class="block mx-auto max-w-36 max-h-36 overflow-hidden rounded">
                    <img
                      src={getOptPassport(user().passport_url)}
                      class="mx-auto w-full"
                    />
                  </div>
                  <div>
                    [
                    <A href="#" class="text-sm text-red-600">
                      Change Passport
                    </A>
                    ]
                  </div>
                </div>
                <div>
                  <b>Matriculation Number:</b>
                  <br />
                  <span class="uppercase">
                    {student().matriculation_number}
                  </span>
                </div>
                <div>
                  <b>Ledger Number:</b>
                  <br />
                  <span class="uppercase">{student().ledger_number}</span>
                </div>
                <div>
                  <b>Year of Admission:</b>
                  <br />
                  {student().year_of_admission}
                </div>
                <div>
                  <b>Phone Number:</b>
                  <br />
                  {user().phone_number}
                </div>
                <div>
                  <b>Surname:</b>
                  <br />
                  <span class="uppercase">{user().surname}</span>
                </div>
                <div>
                  <b>First name:</b>
                  <br />
                  {user().first_name}
                </div>
                <div>
                  <b>Other names:</b>
                  <br />
                  {user().other_names}
                </div>
                <div>
                  <b>Gender:</b>
                  <br />
                  {user().gender}
                </div>
                <div>
                  <b>Email:</b>
                  <br />
                  {student().email.toLowerCase()}
                </div>
                <div>
                  <b>Country of Origin:</b>
                  <br />
                  {student().country_of_origin}
                </div>
                <div>
                  <b>State of Origin:</b>
                  <br />
                  {student().state_of_origin}
                </div>
                <div>
                  <b>Denomination:</b>
                  <br />
                  {student().denomination}
                </div>
                <div>
                  <b>Local Church:</b>
                  <br />
                  {student().local_church}
                </div>
                <div>
                  <b>Name of Pastor:</b>
                  <br />
                  {student().name_of_pastor}
                </div>
                <div>
                  <b>Work Fulltime?:</b>
                  <br />
                  {student().work_fulltime}
                </div>
                <div>
                  <b>Programme Category:</b>
                  <br />
                  {student().programme_category}
                </div>
                <div>
                  <b>Programme:</b>
                  <br />
                  {student().programme}
                </div>
                <div>
                  <b>Special Student Category:</b>
                  <br />
                  {student().special_student_category}
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </MetaProvider>
  );
}
