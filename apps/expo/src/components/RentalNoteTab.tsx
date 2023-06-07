import React, { useMemo, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlashList } from "@shopify/flash-list";
import {
  Heading,
  Button as NativeBaseButton,
  Text,
  View,
  useToast,
} from "native-base";
import { useForm } from "react-hook-form";

import {
  CreateNoteForRentalSchema,
  UpdateNoteSchema,
  type InputCreateNoteForRental,
  type InputUpdateNote,
} from "@acme/validator";

import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus";
import { api, type RouterOutputs } from "../utils/api";
import { DateFormatter } from "../utils/dates";
import Button from "./Button";
import EmptyState from "./EmptyState";
import TextAreaInput from "./TextAreaInput";

type NoteMode = "new" | "edit";

const RentalNoteTab = ({ agreementId }: { agreementId: string }) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const toast = useToast();

  const [noteMode, setNodeMode] = useState<NoteMode>("new");
  const [isOpen, setOpen] = useState(false);

  const apiUtils = api.useContext();

  const snapPoints = useMemo(() => ["70%"], []);

  const {
    control: create_control,
    handleSubmit: create_handleSubmit,
    reset: create_reset,
    watch: create_watch,
    setValue: create_setValue,
  } = useForm<InputCreateNoteForRental>({
    resolver: zodResolver(CreateNoteForRentalSchema),
    defaultValues: {
      rentalId: agreementId,
      content: "",
    },
  });
  const {
    control: edit_control,
    handleSubmit: edit_handleSubmit,
    reset: edit_reset,
    setValue: edit_setValue,
    watch: edit_watch,
  } = useForm<InputUpdateNote>({
    resolver: zodResolver(UpdateNoteSchema),
    values: {
      id: "-no-id-here-",
      content: "",
    },
  });

  const handlePresentPress = () => {
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current?.present();
      setOpen(true);
    }
  };
  const handleDismissPress = () => {
    if (bottomSheetModalRef.current) {
      setOpen(false);
      setNodeMode("new");
      bottomSheetModalRef.current?.dismiss();
      create_reset();
      edit_reset();
    }
  };

  const createNote = api.rental.createAgreementNote.useMutation({
    onSuccess: () => {
      toast.show({
        title: "Success",
        variant: "top-accent",
        description: "Note added",
      });
      handleDismissPress();
    },
    onError: (error) => {
      toast.show({
        title: "Error",
        variant: "top-accent",
        description: error.message,
      });
    },
    onSettled: () => {
      apiUtils.rental.getAgreementNotes.invalidate({ id: agreementId });
      apiUtils.rental.getAgreement.invalidate({ id: agreementId });
    },
  });

  const editNote = api.rental.updateAgreementNote.useMutation({
    onSuccess: () => {
      toast.show({
        title: "Success",
        variant: "top-accent",
        description: "Note saved",
      });
      handleDismissPress();
    },
    onError: (error) => {
      toast.show({
        title: "Error",
        variant: "top-accent",
        description: error.message,
      });
    },
    onSettled: () => {
      apiUtils.rental.getAgreementNotes.invalidate({ id: agreementId });
      apiUtils.rental.getAgreement.invalidate({ id: agreementId });
    },
  });

  // get notes for agreement
  const agreementNotes = api.rental.getAgreementNotes.useQuery({
    id: agreementId,
  });
  useRefreshOnFocus(agreementNotes.refetch);

  const handleCreateSubmitPress = create_handleSubmit(async (data) => {
    createNote.mutate(data);
  });

  const handleEditSubmitPress = edit_handleSubmit(async (data) => {
    editNote.mutate(data);
  });

  const handleEditPress = (noteId: string, content: string) => {
    edit_setValue("id", noteId);
    edit_setValue("content", content);
    handlePresentPress();
    setNodeMode("edit");
  };

  const createContent = create_watch("content");
  const editContent = edit_watch("content");
  const contentValue = noteMode === "new" ? createContent : editContent;

  const clearContent = () => {
    create_setValue("content", "");
    edit_setValue("content", "");
  };

  return (
    <View flex={1}>
      <View mt={4} flexDirection="row" w="full">
        <Button
          w="full"
          onPress={() => {
            setNodeMode("new");
            handlePresentPress();
          }}
          size="sm"
          fontSize="sm"
          disabled={isOpen}
          isDisabled={isOpen}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              gap: 5,
            }}
          >
            <MaterialCommunityIcons name="plus" size={20} color="white" />
            <Text color="white" fontSize={16}>
              New note
            </Text>
          </View>
        </Button>
      </View>
      <View flex={1} mt={4} mb={4}>
        {agreementNotes.status === "success" &&
          agreementNotes.data.length > 0 && (
            <FlashList
              data={agreementNotes.data || []}
              renderItem={({ item }) => (
                <NoteListItem note={item} onPress={handleEditPress} />
              )}
              estimatedItemSize={200}
              onRefresh={agreementNotes.refetch}
              refreshing={agreementNotes.isLoading}
            />
          )}

        {agreementNotes.status === "success" &&
          agreementNotes.data.length === 0 && (
            <View mt={4}>
              <EmptyState
                renderIcon={() => (
                  <MaterialCommunityIcons
                    name="cash-register"
                    size={38}
                    color="black"
                  />
                )}
                title="No notes yet"
                description="No notes have been added yet."
                buttonProps={{
                  text: `Refresh notes${
                    agreementNotes.isFetching || agreementNotes.isRefetching
                      ? "..."
                      : ""
                  }`,
                  onPress: agreementNotes.refetch,
                }}
              />
            </View>
          )}
      </View>
      <BottomSheetModal
        snapPoints={snapPoints}
        ref={bottomSheetModalRef}
        enableHandlePanningGesture
        enablePanDownToClose
        handleComponent={null}
      >
        <View
          bgColor="white"
          flex={1}
          borderTopColor="gray.200"
          borderTopWidth={1.5}
          px={4}
          justifyContent="space-between"
          pt={4}
          pb={4}
        >
          <View>
            <Heading mb={2}>
              {noteMode === "new" ? "New note" : "Edit note"}
            </Heading>
            <View pt={6} flex={1} minHeight={120}>
              <TextAreaInput
                control={noteMode === "new" ? create_control : edit_control}
                name="content"
                label="Content"
                textAreaProps={{
                  numberOfLines: 6,
                  scrollEnabled: true,
                }}
              />
            </View>
            <View mt={8} flexDirection="row" justifyContent="space-between">
              <Text color={contentValue.length > 255 ? "red.600" : "gray.700"}>
                {contentValue.length}/255
              </Text>
              <NativeBaseButton
                variant="link"
                p={0}
                _text={{
                  color: "gray.700",
                }}
                onPress={clearContent}
              >
                Clear
              </NativeBaseButton>
            </View>
          </View>
          <View pb={2}>
            {noteMode === "new" ? (
              <Button
                onPress={handleCreateSubmitPress}
                disabled={createNote.isLoading}
                isDisabled={createNote.isLoading}
              >
                <Text color="white" fontSize={16}>
                  {"Add note"}
                </Text>
              </Button>
            ) : (
              <Button
                onPress={handleEditSubmitPress}
                disabled={editNote.isLoading}
                isDisabled={editNote.isLoading}
              >
                <Text color="white" fontSize={16}>
                  {"Save note"}
                </Text>
              </Button>
            )}
            <NativeBaseButton
              variant="link"
              _text={{ color: "red.500" }}
              onPress={handleDismissPress}
              size="lg"
              disabled={createNote.isLoading || editNote.isLoading}
              isDisabled={createNote.isLoading || editNote.isLoading}
            >
              Cancel
            </NativeBaseButton>
          </View>
        </View>
      </BottomSheetModal>
    </View>
  );
};

export default RentalNoteTab;

type OutputNote = RouterOutputs["rental"]["getAgreementNotes"][number];

const NoteListItem = ({
  note,
  onPress,
}: {
  note: OutputNote;
  onPress: (noteId: string, content: string) => void;
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        onPress(note.id, note.content);
      }}
    >
      <View
        my={1}
        py={2}
        px={2}
        borderStyle="solid"
        borderWidth={1.5}
        borderColor="gray.500"
        borderRadius={5}
        flexDirection="row"
        style={{ gap: 10 }}
      >
        <View flex={1}>
          <View flexDirection="row" justifyContent="space-between">
            <Text color="gray.600">
              {DateFormatter.rentalListView(note.createdAt)}
            </Text>
            <View pr={1}>
              <AntDesign name="edit" size={18} color="black" />
            </View>
          </View>
          <Text
            fontSize={18}
            fontWeight="medium"
            color="gray.700"
            numberOfLines={3}
            ellipsizeMode="tail"
            minHeight={50}
          >
            {note.content}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
