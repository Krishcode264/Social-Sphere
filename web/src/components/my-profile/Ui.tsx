"use client";
import { buttonBaseClasses } from "@mui/material";
import React, { useEffect, useRef, useState, type ReactNode } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
export type Updater = (
  property: string,
  value: string,
  remove?: boolean
) => void;
export const InfoTemplate = ({
  property,
  value,
  updater,
  id,
}: {
  property: string;
  value: string | number | undefined;
  updater: Updater;
  id: string;
}) => {
  return (
    <div className="p-2  w-full md:w-[50%]">
      <h1 className="m-0 text-slate-300 my-1 font-semibold">{property}</h1>
      <input
        className="py-1.5 px-2 rounded-md  bg-slate-800 text-slate-400"
        type="text"
        value={value}
        onChange={(e) => updater(id, e.target.value)}
      />
    </div>
  );
};

export const InfoTemplateWithOptions = ({
  property,
  value,
  options,
  id,
  updater,
}: {
  property: string;
  value: string | number;
  options: string[];
  id: string;
  updater: Updater;
}) => {
  return (
    <div className="p-2  w-full md:w-[50%]">
      <h1 className="m-0 text-slate-300 my-1 font-semibold">{property}</h1>
      <select
        className="w-full  text-lg px-2 py-3 rounded-xl text-slate-400 bg-slate-800"
        value={value}
        onChange={(e) => {
          if (e.currentTarget.value !== "select-option") {
            updater(id, e.currentTarget.value);
          }
        }}
      >
        <option className="p-4 text-slate-200 " value="select-option"></option>
        {options.map((option, index) => (
          <option
            key={index}
            className="p-4  bg-slate-900 text-slate-300"
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};
export const generateSinglet = (
  intrests: string[],
  editable?: boolean,
  id?: string,
  updater?: Updater
) => {
  return intrests.map((intrest) => {
    return (
      <span
        key={intrest}
        className="  group relative font-mono  text-slate-300 rounded-lg block  bg-blue-600  "
      >
        {editable && (
          <button
            onClick={() => {
              if (id && updater) {
                updater(id, intrest, true);
              }
            }}
            className="group/btn  hidden absolute bottom-5 right-0  group-hover:block  "
          >
            <ClearIcon className="group-hover/btn:text-orange-600 text-2xl text-white" />

          </button>
        )}
        <p className="px-1 py-1   text-l"> {intrest}</p>
      </span>
    );
  });
};

export const InfoTemplateWithIntrests = ({
  intrests,
  editable,
  id,
  updater,
  color
}: {
  intrests: string[];
  editable?: boolean;
  id?: string;
  updater?: Updater;
  color?:string
}) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-4 p-1 flex-wrap  items-baseline">
      { intrests && intrests?.length>0 && generateSinglet(intrests, editable, id, updater)}

      {editable && (
        <span className=" p-1 rounded-xl bg-slate-800 font-semibold font-mono hover:border border-slate-100 block">
          <input
            ref={ref}
            type="text"
            placeholder="Add New"
            style={{backgroundColor:color}}
            className="text-l rounded-md py-1.5 px-2 mr-2 bg-slate-800   "
          />
          <button
            onClick={(e) => {
              if (id && updater && ref?.current?.value.trim()) {
                if (intrests.includes(ref.current.value.trim())) {
                  return;
                }
                updater(id, ref?.current?.value.trim());
                ref.current.value = "";
              }
            }}
            className="bg-orange-600 rounded-md text-l hover:text-slate-100 px-4 py-1.5 text-slate-300 "
          >
            Add
          </button>
        </span>
      )}
    </div>
  );
};
