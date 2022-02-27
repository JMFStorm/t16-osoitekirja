import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Pressable,
} from "react-native";
import { Icon, Input, Header, ListItem } from "react-native-elements";
import * as SQLite from "expo-sqlite";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const db = SQLite.openDatabase("locationdb.db");

export default function App() {
  const [address, setAddress] = React.useState("");
  const [addresses, setAddresses] = React.useState([]);

  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists location (id integer primary key not null, address text);"
      );
    });
    updateList();
  }, []);

  const saveItem = () => {
    db.transaction(
      (tx) => {
        tx.executeSql("insert into location (address) values (?);", [address]);
      },
      null,
      updateList
    );
  };

  const updateList = () => {
    setAddress("");
    db.transaction((tx) => {
      tx.executeSql("select * from location;", [], (_, { rows }) =>
        setAddresses(rows._array)
      );
    });
  };

  const deleteItem = (id) => {
    db.transaction(
      (tx) => {
        tx.executeSql(`delete from location where id = ?;`, [id]);
      },
      null,
      updateList
    );
  };

  console.log(addresses);

  const ListView = () => {
    return (
      <View>
        <Input
          placeholder="Type new address"
          label="Address"
          onChangeText={(address) => setAddress(address)}
          value={address}
        />
        <Pressable
          style={styles.button}
          onPress={saveItem}
          title="save"
          accessibilityLabel="save"
        >
          <Text style={styles.text}>Save</Text>
        </Pressable>
        {addresses && (
          <FlatList
            style={{ width: "100%" }}
            keyExtractor={({ id }) => id.toString()}
            renderItem={renderItem}
            data={addresses}
          />
        )}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <ListItem bottomDivider>
      <ListItem.Content>
        <ListItem.Title>
          {item.address}
          <Pressable
            title="Clear"
            accessibilityLabel="Clear"
            onPress={() => deleteItem(item.id)}
          >
            <Text>View on map</Text>
          </Pressable>
        </ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="ListView" component={ListView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    alignItems: "center",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: "80%",
  },
  buttons: {
    marginBottom: 24,
    width: "50%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "#2222cc",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
});
