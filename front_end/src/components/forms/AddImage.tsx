import React, { useState, ChangeEvent, FormEvent } from "react";
import { Modal } from "react-bootstrap";
import { uploadVacationImage } from "../../api/vactions/vactions-api";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";

type propsType = {
  pid: number;
  setShowModal: any;
  showModal: boolean;
};

export const AddImage = (props: propsType) => {  
  const [image, setImage] = useState<File | null>(null);
  const { user } = useSelector((state: RootState) => state.auth); // Assuming user token is stored in auth state

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (image && user?.token) {
      try {
        await uploadVacationImage(props.pid, image, user.token);
        alert("Image added");
        props.setShowModal(false);
      } catch (error) {
        alert("Failed to upload image");
        console.error(error);
      }
    } else {
      alert("You must select an image and be logged in");
    }
  };

  return (
    <Modal
      show={props.showModal}
      onHide={() => {
        props.setShowModal(false);
      }}
    >
      <div style={{ padding: "4%" }}>
        <form onSubmit={handleSubmit}>
          <p> image-id: {props.pid} </p>
          <input
            type="file"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (e.target.files) setImage(e.target.files[0]);
            }}
            required
          />
          <br />
          <br />
          <button type="submit">Upload Image</button>
        </form>
      </div>
    </Modal>
  );
};