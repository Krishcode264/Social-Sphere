import { useResetRecoilState } from "recoil";
import {
  userBasicInfoState,
  userConnectivityState,
  userPreferencesState,
} from "@/store/atoms/user-atom"; 
import { userPermissionState } from "@/store/atoms/user-permissions_atom";
import { pcState, offerState } from "@/store/atoms/pc-atom";
import { mediaStreamState } from "@/store/atoms/media-stream-atom";
import { guestState } from "@/store/atoms/guest-atom";
import { connectedUsersState } from "@/store/atoms/socket-atom";
import { showComponentState } from "@/store/atoms/show-component";
import { callState } from "@/store/atoms/calling-state";
const useResetAllState = () => {
  const resetUserBasicInfo = useResetRecoilState(userBasicInfoState);
  const resetUserConnectivity = useResetRecoilState(userConnectivityState);
  const resetUserPreferences = useResetRecoilState(userPreferencesState);
  const resetUserPermission = useResetRecoilState(userPermissionState);
  const resetConnectedUsers = useResetRecoilState(connectedUsersState);
  const resetShowComponent = useResetRecoilState(showComponentState);
  const resetPcState = useResetRecoilState(pcState);
  const resetOfferState = useResetRecoilState(offerState);
  const resetMediaStreamState = useResetRecoilState(mediaStreamState);
  const resetGuestState = useResetRecoilState(guestState);
  const resetCallState = useResetRecoilState(callState);

  const resetAll = () => {
    resetUserBasicInfo();
    resetUserConnectivity();
    resetUserPreferences();
    resetUserPermission();
    resetConnectedUsers();
    resetShowComponent();
    resetPcState();
    resetOfferState();
    resetMediaStreamState();
    resetGuestState();
    resetCallState();
  };

  return resetAll;
};

export default useResetAllState;
