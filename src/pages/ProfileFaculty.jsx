import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";

import Header from "../components/Header";
import Loading from "../components/Loading";

export default function ProfileFaculty() {
  const VITE_API_URL = import.meta.env["VITE_API_URL"];
  const [loading, setLoading] = createSignal(true);
  const [user, setUser] = createSignal("");

  createEffect(async () => {
    const navigate = useNavigate();
    try {
      const res = await fetch(
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
      const result = await res.json();
      if (result.response === "Expired token") {
        localStorage.removeItem("jetsUser");
        navigate("/");
      }
      setUser(result.response);
    } catch (error) {
      console.error(error);
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
      <Title>Faculty Profile - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Faculty Profile on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <Show when={user() !== ""} fallback={<Loading />}>
          <div class="mt-8 mb-20 w-11/12 mx-auto space-y-4">
            <h2 class="text-lg font-semibold text-center border-b border-red-600">
              Faculty Profile
            </h2>
            <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
              <b class="block">Instruction:</b>
              <p>Below is your profile as seen by students.</p>
            </div>
            <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4">
              <div class="flex space-x-6">
                <div class="w-28 text-center">
                  {user().passport_url ? (
                    <img
                      src={getOptPassport(user().passport_url)}
                      class="mx-auto w-11/12"
                    />
                  ) : (
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/9131/9131529.png"
                      class="w-11/12 mx-auto"
                    />
                  )}
                  <br />[
                  <A href="#" class="text-xs text-red-600">
                    Change Passport
                  </A>
                  ]
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-12">
                  <div>
                    <b>Name:</b> [
                    <span class="text-xs text-red-600">Edit Name</span>
                    ]
                    <br />
                    <span class="flex">
                      {user().title ? (
                        <span class="mr-1">{user().title}</span>
                      ) : (
                        ""
                      )}
                      <span class="uppercase">{user().surname}</span>
                      <span class="capitalize mx-1">{user().first_name}</span>
                      <span class="capitalize">{user().other_names}</span>
                    </span>
                  </div>
                  <div>
                    <b>Email Address:</b>
                    <br />
                    {user().username}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </MetaProvider>
  );
}
