import { MinusCircleOutlined, PlusCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Badge, List } from 'antd';
import { useNavigate } from 'react-router-dom';
import { pluralFormFactory } from '../../../../shared/Factories';
import { actionHandler } from '../../../../store/Actions';
import { Action, useStore } from '../../../../store/Store';
import { StorageModel } from '../../StorageModel';
// Icons aus react-icons importieren
import { BiSolidFridge } from 'react-icons/bi';
import { BsBookshelf } from 'react-icons/bs';
import styles from './StorageListItem.module.css';
import SafeAvatar from '../../../common/SafeAvatar';
import { ReactElement, SyntheticEvent, useEffect, useState } from 'react';

interface Props {
    storageItem: StorageModel;
}

export default function StorageListItem(props: Props): ReactElement {
    const { storageItem } = props;
    const history = useNavigate();
    const { store, dispatch } = useStore();

    const [amount, setAmount] = useState(store.shoppingCard.find(item => item.name === storageItem.name)?.amount || 0);

    // Statt einer lokalen amount-Variable greifen wir direkt auf storageItem.amount zu.
    // Aktionen für Bestandsänderungen werden über den actionHandler ausgelöst.
    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        event.preventDefault();
        actionHandler(action, dispatch);
    };

    // Farbklassenzuordnung basierend auf dem aktuellen Bestand
    const getAvailable = () => {
        let colorClass = styles.lowAmount;
        if (storageItem.amount > storageItem.midAmount) {
            colorClass = styles.highAmount;
        } else if (storageItem.amount <= storageItem.midAmount && storageItem.amount > storageItem.lowestAmount) {
            colorClass = styles.midAmount;
        }
        return (
            <>
                <span>Bestand: </span>
                <span className={colorClass}>
                    {storageItem.amount} {pluralFormFactory(storageItem.unit, storageItem.amount)}
                </span>
            </>
        );
    };

    // Mapping-Funktion für die Storage-Location
    const getLocationIcon = (location: string) => {
        const loc = location.toLowerCase();
        if (loc.includes('kühlregal')) {
            return (
                <span title="Tiefkühler" className={styles.icon}>
                    ❄️
                </span>
            );
        } else if (loc.includes('kühlschrank') || loc.includes('fach')) {
            return (
                <span title="Kühlschrank" className={styles.icon}>
                    <BiSolidFridge className={styles.iconFridge} title="Kühlschrank" />
                </span>
            );
        } else if (loc.includes('lager') || loc.includes('keller') || loc.includes('speisekammer')) {
            return (
                <span title="Lager" className={styles.icon}>
                    <BsBookshelf className={styles.iconShelf} title="Lager" />
                </span>
            );
        }
        return null;
    };

    const onIncrease = (e: React.FormEvent) => {
        e.stopPropagation();
        console.log(`🔧 Manual increase triggered for item ${storageItem.id} (${storageItem.name})`);
        console.trace('Increase action call stack');
        actionHandler({ type: 'INCREASE_STORAGE_ITEM', storageItem: { ...storageItem, amount: storageItem.amount + 1 } }, dispatch);
    };

    const onDecrease = (e: React.FormEvent) => {
        e.stopPropagation();
        console.log(`🔧 Manual decrease triggered for item ${storageItem.id} (${storageItem.name})`);
        console.trace('Decrease action call stack');
        const next = Math.max(0, storageItem.amount - 1);
        // If it's already 0, avoid dispatching and thus avoid a redundant PUT
        if (next === storageItem.amount) return;
        actionHandler({ type: 'DECREASE_STORAGE_ITEM', storageItem: { ...storageItem, amount: next } }, dispatch);
    };
    const getBasketModel = (item: StorageModel) => ({
        id: item.id,
        name: item.name,
        amount: "0",
        categories: item.categories || [],
        icon: item.icon || ""
    });

    const onAddToBasket = (e: React.FormEvent) => {
        e.stopPropagation();
        onChangeCard(e, { type: 'ADD_TO_CARD', basketItems: getBasketModel(storageItem) });
        setAmount(prevAmount => parseInt(prevAmount.toString()) + 1);
    };

    return (
        <List.Item
            onClick={() => history(`/items/${storageItem.id}`)}
            className={styles.title}
            actions={[
                <MinusCircleOutlined
                    className={styles.iconAction}
                    onClick={(e) => onDecrease(e)}
                    key={`minus${storageItem.id}`}
                />,
                <Badge
                    key={`shopping${storageItem.id}`}
                    size="default"
                    count={amount}
                    offset={[0, 5]}
                    style={{ backgroundColor: '#52c41a' }}
                >
                    <ShoppingCartOutlined
                        className={styles.iconAction}
                        onClick={(e) => onAddToBasket(e)}
                    />
                </Badge>,
                <PlusCircleOutlined
                    className={styles.iconAction}
                    onClick={(e) => onIncrease(e)}
                    key={`plus${storageItem.id}`}
                />
            ]}
        >
            <List.Item.Meta
                avatar={<SafeAvatar src={storageItem.icon} showWarnings={process.env.NODE_ENV === 'development'} />}
                title={
                    <div className={styles.metaTitleContainer}>
                        <span>{storageItem.name}</span>
                        <span>{getLocationIcon(storageItem.storageLocation)}</span>
                    </div>
                }
                description={getAvailable()}
                key={`meta${storageItem.id}`}
            />
        </List.Item>
    );
}
