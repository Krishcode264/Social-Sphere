import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { useSetRecoilState } from "recoil";
import { updateUser } from "@/store/selectors/user-selector";
import { showComponentState } from "@/store/atoms/show-component";
export const UserForm: React.FC = () => {
  const [name, setName] = useState("");

  const setUser = useSetRecoilState(updateUser);
  const setShowComponent = useSetRecoilState(showComponentState);

  const handleSaveUserForm = () => {
    if (name === "") {
      return;
    }

    setShowComponent((prev) => ({
      ...prev,
      showform: false,
      showWebrtcConnection: true,
    }));
    setUser((prev) => ({ ...prev, name, id: uuidv4() }));
  };

  return (
    <div className="p-6 relative justify-between h-40 m-auto top-56 rounded-xl mb:w-[80%] w-1/2 sm:w-1/3   flex flex-col bg-gradient-to-br from-blue-900 to-sky-950">
      <input
        className="p-1 py-2 rounded-lg outline-0 text-xl "
        type="text"
        onChange={(e) => setName(() => e.target.value)}
        value={name}
        placeholder="enter your name"

      />
      <button
        className="p-2  rounded-xl bg-voilet-300 text-white text-xl shadow-lg border border-slate-500 hover:border-slate-200 "
        onClick={handleSaveUserForm}
      >
        join
        {/* <IconBtn icon={LoginIcon} br="50%" color="white" /> */}
      </button>
    </div>
  );
};
