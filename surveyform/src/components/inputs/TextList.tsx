"use client";
import React, { useRef, useState, RefObject /*, { useState }*/ } from "react";
import FormControl from "react-bootstrap/FormControl";
import { FormInputProps } from "~/components/form/typings";
import { FormItem } from "~/components/form/FormItem";
import debounce from "lodash/debounce.js";
import { useIntlContext } from "@devographics/react-i18n";

/**
 * In an array of input with auto-deletion of empty inputs,
 * each input must be associated with a key to become an entity
 */
interface Item {
  value: string;
  key: string;
}

function toStrings(items: Array<Item>): Array<string> {
  return items.map(({ value }) => value);
}

const itemId = (item: Item) => `textlist-item-${item.key}`;
const itemSelector = (item: Item) => `[data-id="${itemId(item)}"]`;
const selectItem = (
  wrapper: Element | undefined | null,
  item: Item
): HTMLInputElement | null | undefined => {
  const maybeItem = wrapper?.querySelector(itemSelector(item));
  if (!maybeItem) console.warn(`Item ${item.key}:${item.value} not found`);
  if (maybeItem instanceof HTMLInputElement) {
    return maybeItem;
  }
};

const focusInputEnd = (maybeInput: HTMLInputElement | null | undefined) => {
  if (!maybeInput) return;
  maybeInput.focus();
  if (maybeInput.value?.length) {
    maybeInput.setSelectionRange(
      maybeInput.value.length,
      maybeInput.value.length
    ); // hack to force focusing at the end
  }
};

/**
 * Return a unique value on each call of the next function
 * (Math.Random is not suited as it can create SSR discrepencies)
 */
const useUniqueSeq = () => {
  const seqRef = useRef(0);
  return function next() {
    seqRef.current++;
    return seqRef.current;
  };
};

const DEFAULT_LIMIT = 10;

/**
 * A list of multiple text inputs (or textarea if long=true)
 *
 * "limit" options sets a limit (default is 10 responses)
 * "longText" option uses textarea instead of inputs
 *
 * TODO: we have a logic that maintains an additional "lastItem"
 * We could instead accept empty inputs in between values, this is what is preferred in the mockup
 * For instance Enter would create new input and focus on it, unless there is already an empty input below,
 * or current input is itself empty?
 *
 * TODO: check mockup https://github.com/LeaVerou/stateof/tree/main/mocks/custom-options
 * TODO: see arrays from Vulcan: https://github.com/VulcanJS/vulcan-npm/tree/main/packages/react-ui-lite/components/form/nested
 *
 * Components are defined here: surveyform/src/lib/customComponents.ts
 * @param props
 * @returns
 */
export const TextList = (props: FormInputProps<Array<string>>) => {
  const {
    path,
    value: value_,
    question,
    updateCurrentValues,
    readOnly,
  } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const getUniqueKey = useUniqueSeq();
  function makeItem(value: string): Item {
    return { value, key: getUniqueKey() + "" };
  }

  // TODO: check that the key is correctly set based on "value"
  // @see https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes
  const values = value_ || [];

  const [items, setItems] = useState<Array<Item>>(values.map(makeItem));

  const [lastItem, setLastItem] = useState(makeItem(""));

  // Values update
  // TODO: assess if debouncing is really needed here, onchange is fired only on focus loss
  // (contrary to "oninput" which actually needs debouncing)
  // it seems that React Bootstrap treats onChange as onInput
  const updateCurrentValuesDebounced = debounce(updateCurrentValues, 500);
  const updateAllItems = (items: Array<Item>) => {
    setItems(items);
    updateCurrentValuesDebounced({ [path]: toStrings(items) });
  };
  const limit = Math.max(DEFAULT_LIMIT, question.limit || 0);
  const addItem = (item: Item) => {
    updateAllItems([...items, item]);
    // we need a new last item
    setLastItem(makeItem(""));
  };
  const removeItem = (idx: number) => {
    updateAllItems([...items.slice(0, idx), ...items.slice(idx + 1)]);
    // TODO: should we remove the value if the array becomes totally empty?
    // by setting it to "null"?
  };
  const updateItem = (idx: number, value: string) => {
    updateAllItems([
      ...items.slice(0, idx),
      { value, key: items[idx].key },
      ...items.slice(idx + 1),
    ]);
  };

  // Focus management
  const selectPreviousItem = (index: number) =>
    //previous item is necessarily an existing item
    selectItem(wrapperRef.current, items[index - 1]);
  const selectLastItem = () => selectItem(wrapperRef.current, lastItem);
  const selectNextItem = (index: number) => {
    console.log("selecting next item", index, items.length);
    if (index === items.length - 1) {
      return selectLastItem();
    }
    return selectItem(wrapperRef.current, items[index + 1]);
  };

  const onItemBlur = (
    index: number,
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement> // onBlur
  ) => {
    const value = event.target.value;
    if (!value) {
      // TODO: is it enough to handle it via backspace?
      // removeItem(index);
    } else {
      updateItem(index, value);
    }
  };

  const onItemChange = (index: number, key: string, evt) => {
    // The last item is displayed but not yet saved in the items list
    const isLastItem = index >= items.length;
    const value = evt.target.value;
    // if we start filling the last item,
    // add this item to the actual items,
    // and create a new last item
    if (isLastItem) {
      if (value && items.length <= limit) {
        addItem({ value, key });
      }
    }
  };
  const onItemKeyDown = (
    index: number,
    evt: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // @ts-ignore TODO: not sure why we don't have a value despite using an HTMLInputElement
    const value: string = evt.target.value;
    if (evt.key === "Enter") {
      // Leave textarea behaviour alone
      if (question.longText) return;
      // Pressing enter when focusing on an empty last item => submit the form as usual
      // (last item is always empty, sinc starting to type in it will create a new empty last item)
      if (index === items.length) return;
      // Otherwise, we instead focus on next item
      evt.stopPropagation();
      evt.preventDefault();
      focusInputEnd(selectNextItem(index));
    } else if (evt.key === "ArrowUp") {
      if (index > 0) {
        focusInputEnd(selectPreviousItem(index));
      }
    } else if (evt.key === "ArrowDown") {
      if (index < items.length) {
        focusInputEnd(selectNextItem(index));
      }
    } else if (evt.key === "Backspace" || evt.key === "Delete") {
      // let the input handle deletion if there are chars to delete
      if (value.length > 0) return;
      // if there is only one last char before deletion, remove the item and focus on next one
      evt.preventDefault();
      if (index === items.length) {
        // we are in the last item, if possible focus on previous one
        if (index > 0) {
          focusInputEnd(selectPreviousItem(index));
        }
      } else if (index > 0) {
        // we are in the middle (not last item, but there is a previous item)
        focusInputEnd(selectPreviousItem(index));
        removeItem(index);
      } else if (items.length > 0) {
        // there are no previous item, but there is a next one
        focusInputEnd(selectNextItem(0));
        removeItem(index);
      }
    }
  };

  const itemProps = {
    question,
    items,
    readOnly,
    wrapperRef,
    lastItem,
  };

  const allItems = items.length < limit ? [...items, lastItem] : items;

  return (
    <FormItem {...props} ref={wrapperRef}>
      {allItems.map((item, index) => (
        <TextListItem
          key={item.key}
          {...itemProps}
          index={index}
          item={item}
          onBlur={(evt) => onItemBlur(index, evt)}
          onChange={(evt) => onItemChange(index, item.key, evt)}
          onKeyDown={(evt) => onItemKeyDown(index, evt)}
        />
      ))}
    </FormItem>
  );
};

const TextListItem = ({
  question,
  item,
  index,
  readOnly,
  onBlur,
  onChange,
  onKeyDown,
}: {
  question: FormInputProps["question"];
  item: Item;
  index: number;
  readOnly?: boolean;
  onBlur: React.EventHandler<
    React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  >;
  onChange: React.EventHandler<
    React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  >;
  onKeyDown: React.EventHandler<
    React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  >;
}) => {
  const { formatMessage } = useIntlContext();

  return (
    <FormControl
      // id={itemId(item)}
      // boostrap ain't happy with id, we just need a way to select the input imperatively to handle focus
      data-id={itemId(item)}
      style={{
        marginTop: "4px",
        marginBottom: "4px",
      }}
      // TODO: use different templates to simplify?
      as={question.longText ? "textarea" : "input"}
      placeholder={formatMessage({
        id: "textlist.placeholder",
        values: { index: index + 1 },
      })}
      defaultValue={item.value}
      //value={localValue}
      //onChange={(evt) => handleChangeDebounced(idx, evt)}
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={readOnly}
    />
  );
};
